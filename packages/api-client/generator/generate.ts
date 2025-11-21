import type {
	SourceFile,
	Project,
	ObjectLiteralExpression,
	PropertyAssignment,
	SatisfiesExpression,
	AsExpression,
	Node,
} from 'ts-morph';
import { SyntaxKind } from 'ts-morph';
import {
	FilePatterns,
	ErrorProperties,
	ErrorConstants,
	ImportNames,
	PackageNames,
	StringPatterns,
	ImportTransforms,
} from './constants';
import {
	scanAndTransformImports,
	scanExports,
	transformExports,
	getCreateDtoSchemasCalls,
	extractRequestProperties,
	extractResponseProperties,
	extractErrorCodes,
	extractSharedExports,
	extractSharedImports,
	separateTypeAndValueImports,
} from './transform';
import { toModuleName, isCommonDto } from './utils';

export type ErrorInfo = {
	status: number;
	detailsSchemaText: string;
};

/** Extract APP_ERRORS mapping from backend errors.ts */
export const extractAppErrorsMapping = (
	project: Project,
	rootDir: string,
): Map<string, ErrorInfo> => {
	const errorsPath = `${rootDir}/${FilePatterns.ErrorsMappingPath}`;

	let errorsSource = project.getSourceFile(errorsPath);

	if (!errorsSource) {
		try {
			errorsSource = project.addSourceFileAtPath(errorsPath);
		} catch {
			const allFiles = project.getSourceFiles();
			errorsSource = allFiles.find((file) => {
				const path = file.getFilePath();
				return path === errorsPath || path.endsWith(FilePatterns.ErrorsMappingPath);
			});
		}
	}

	if (!errorsSource) {
		console.warn(`Cannot find errors.ts file at ${errorsPath}, using fallback error mapping`);
		return new Map();
	}

	const mapping = new Map<string, ErrorInfo>();

	const variableStatements = errorsSource.getVariableStatements();
	const appErrorsVar = variableStatements.find((vs) => {
		const decls = vs.getDeclarationList().getDeclarations();
		return decls.some(
			(decl) => decl.getNameNode()?.getText() === ErrorConstants.AppErrorsVariableName,
		);
	});

	if (!appErrorsVar) {
		console.warn(
			`Cannot find ${ErrorConstants.AppErrorsVariableName} constant in ${errorsSource.getFilePath()}, using fallback error mapping`,
		);
		return new Map();
	}

	const decl = appErrorsVar
		.getDeclarationList()
		.getDeclarations()
		.find((d) => d.getNameNode()?.getText() === ErrorConstants.AppErrorsVariableName);

	if (!decl) {
		return new Map();
	}

	const initializer = decl.getInitializer();

	if (!initializer) {
		console.warn(`${ErrorConstants.AppErrorsVariableName} has no initializer`);
		return new Map();
	}

	let objLiteral: ObjectLiteralExpression | null = null;
	let currentExpr: Node = initializer;

	// Handle `as const satisfies` syntax (may have multiple layers)
	while (currentExpr && !objLiteral) {
		const kind = currentExpr.getKind();

		if (kind === SyntaxKind.ObjectLiteralExpression) {
			objLiteral = currentExpr as ObjectLiteralExpression;
			break;
		} else if (kind === SyntaxKind.AsExpression) {
			const asExpr = currentExpr as AsExpression;
			currentExpr = asExpr.getExpression();
		} else if (kind === SyntaxKind.SatisfiesExpression) {
			const satisfiesExpr = currentExpr as SatisfiesExpression;
			currentExpr = satisfiesExpr.getExpression();
		} else {
			console.warn(
				`Unexpected expression kind in ${ErrorConstants.AppErrorsVariableName} initializer: ${kind} (${SyntaxKind[kind]})`,
			);
			return new Map();
		}
	}

	if (!objLiteral) {
		console.warn(
			`Cannot extract ObjectLiteralExpression from ${ErrorConstants.AppErrorsVariableName} initializer`,
		);
		return new Map();
	}

	const properties = objLiteral.getProperties();

	for (const prop of properties) {
		if (prop.getKind() !== SyntaxKind.PropertyAssignment) {
			continue;
		}

		const propAssign = prop as PropertyAssignment;
		const nameNode = propAssign.getNameNode();
		const errorCode = nameNode.getText().replace(/['"]/g, '');

		const propValue = propAssign.getInitializer();

		if (!propValue || propValue.getKind() !== SyntaxKind.ObjectLiteralExpression) {
			continue;
		}

		const errorObj = propValue as ObjectLiteralExpression;

		let statusCode: number | null = null;
		let detailsSchemaText: string = ErrorConstants.FallbackDetailsSchema;

		for (const errorProp of errorObj.getProperties()) {
			if (errorProp.getKind() !== SyntaxKind.PropertyAssignment) {
				continue;
			}

			const errorPropAssign = errorProp as PropertyAssignment;
			const errorPropName = errorPropAssign.getNameNode()?.getText();

			if (errorPropName === ErrorProperties.Status) {
				const statusValue = errorPropAssign.getInitializer();

				if (statusValue && statusValue.getKind() === SyntaxKind.NumericLiteral) {
					statusCode = parseInt(statusValue.getText(), 10);
				}
			} else if (errorPropName === ErrorProperties.Details) {
				const detailsValue = errorPropAssign.getInitializer();
				if (detailsValue) {
					detailsSchemaText = detailsValue.getText();
				}
			}
		}

		if (statusCode !== null) {
			mapping.set(errorCode, {
				status: statusCode,
				detailsSchemaText,
			});
		}
	}

	return mapping;
};

/** Get details schema text for error code */
const getErrorDetailsSchema = (errorCode: string, errorMapping: Map<string, ErrorInfo>): string => {
	if (errorMapping.has(errorCode)) {
		return errorMapping.get(errorCode)!.detailsSchemaText;
	}
	return ErrorConstants.FallbackDetailsSchema;
};

/** Generate Common DTO file content with dependency sorting */
const generateCommonDtoContent = (source: SourceFile, moduleName: string): string => {
	const imports = scanAndTransformImports(source, {
		moduleName,
		isDto: true,
	});

	const content: string[] = [];

	if (imports.length > 0) {
		content.push(...imports);
		content.push('');
	}

	// Collect exported variables
	const exportedVarNames = new Set<string>();
	const allExportedTexts: string[] = [];
	const exportedVars = source.getVariableStatements().filter((vs) => vs.isExported());
	const exportedVarMap = new Map<string, string>();

	for (const varStmt of exportedVars) {
		const text = varStmt.getText();
		const decls = varStmt.getDeclarationList().getDeclarations();
		for (const decl of decls) {
			const nameNode = decl.getNameNode();
			if (nameNode) {
				const varName = nameNode.getText();
				exportedVarNames.add(varName);
				exportedVarMap.set(varName, text);
			}
		}
	}

	// Sort exports by dependencies
	const sortedExportedVars: string[] = [];
	const processedExports = new Set<string>();

	const sortExports = (varName: string) => {
		if (processedExports.has(varName)) return;

		const varText = exportedVarMap.get(varName);
		if (!varText) return;

		const deps = Array.from(exportedVarNames).filter(
			(name) => name !== varName && varText.includes(name),
		);

		for (const dep of deps) {
			sortExports(dep);
		}

		sortedExportedVars.push(varText);
		allExportedTexts.push(varText);
		processedExports.add(varName);
	};

	for (const varName of exportedVarNames) {
		sortExports(varName);
	}

	// Collect private variables referenced by exports
	const privateVarMap = new Map<string, string>();
	const allVars = source.getVariableStatements();

	for (const varStmt of allVars) {
		if (!varStmt.isExported()) {
			const decls = varStmt.getDeclarationList().getDeclarations();
			for (const decl of decls) {
				const nameNode = decl.getNameNode();
				if (nameNode) {
					const varName = nameNode.getText();
					const allExportedTextsCombined = allExportedTexts.join('\n');
					const isReferenced = allExportedTextsCombined.includes(varName);
					if (isReferenced) {
						privateVarMap.set(varName, varStmt.getText());
						break;
					}
				}
			}
		}
	}

	// Collect transitive private dependencies
	let hasNewDeps = true;
	while (hasNewDeps) {
		hasNewDeps = false;
		const privateVarNames = Array.from(privateVarMap.keys());

		for (const varStmt of allVars) {
			if (!varStmt.isExported()) {
				const decls = varStmt.getDeclarationList().getDeclarations();
				for (const decl of decls) {
					const nameNode = decl.getNameNode();
					if (nameNode) {
						const varName = nameNode.getText();
						if (!privateVarMap.has(varName)) {
							const text = varStmt.getText();
							const isReferenced = privateVarNames.some((name) =>
								text.includes(name),
							);
							if (isReferenced) {
								privateVarMap.set(varName, text);
								hasNewDeps = true;
							}
						}
					}
				}
			}
		}
	}

	// Determine which exports are used by private variables
	const exportedUsedByPrivate = new Set<string>();
	for (const [, varText] of privateVarMap) {
		for (const exportedVarName of exportedVarNames) {
			if (varText.includes(exportedVarName)) {
				exportedUsedByPrivate.add(exportedVarName);
			}
		}
	}

	// Separate early and late exports
	const earlyExports: string[] = [];
	const lateExports: string[] = [];
	for (const exportedText of sortedExportedVars) {
		const isEarly = Array.from(exportedUsedByPrivate).some(
			(name) =>
				exportedText.includes(`${StringPatterns.ExportConstPrefix}${name}`) ||
				exportedText.includes(`${StringPatterns.ExportConstPrefix}${name} =`),
		);
		if (isEarly) {
			earlyExports.push(exportedText);
		} else {
			lateExports.push(exportedText);
		}
	}

	// Sort private variables by dependencies
	const sortedPrivateVars: string[] = [];
	const processed = new Set<string>();

	const sortVars = (varName: string, varText: string) => {
		if (processed.has(varName)) return;

		const privateDeps = Array.from(privateVarMap.keys()).filter(
			(name) => name !== varName && varText.includes(name),
		);

		for (const dep of privateDeps) {
			const depText = privateVarMap.get(dep);
			if (depText) {
				sortVars(dep, depText);
			}
		}

		sortedPrivateVars.push(varText);
		processed.add(varName);
	};

	for (const [varName, varText] of privateVarMap) {
		sortVars(varName, varText);
	}

	// Build content: early exports -> private vars -> late exports
	if (earlyExports.length > 0) {
		content.push(earlyExports.join('\n\n'));
		content.push('');
	}

	if (sortedPrivateVars.length > 0) {
		content.push(sortedPrivateVars.join('\n\n'));
		content.push('');
	}

	if (lateExports.length > 0) {
		content.push(lateExports.join('\n\n'));
	}

	// Add types, interfaces, enums
	const exportedTypes = source.getTypeAliases().filter((type) => type.isExported());
	if (exportedTypes.length > 0) {
		const lastItem = content[content.length - 1];
		if (lastItem && !lastItem.endsWith('\n')) {
			content.push('');
		}
		for (const type of exportedTypes) {
			content.push(type.getText());
		}
	}

	const exportedInterfaces = source.getInterfaces().filter((iface) => iface.isExported());
	if (exportedInterfaces.length > 0) {
		const lastItem = content[content.length - 1];
		if (lastItem && !lastItem.endsWith('\n')) {
			content.push('');
		}
		for (const iface of exportedInterfaces) {
			content.push(iface.getText());
		}
	}

	const exportedEnums = source.getEnums().filter((enumDecl) => enumDecl.isExported());
	if (exportedEnums.length > 0) {
		const lastItem = content[content.length - 1];
		if (lastItem && !lastItem.endsWith('\n')) {
			content.push('');
		}
		for (const enumDecl of exportedEnums) {
			content.push(enumDecl.getText());
		}
	}

	return content.join('\n');
};

/** Generate DTO file content from createDtoSchemas calls */
export const generateDtoFile = (
	source: SourceFile,
	moduleName: string,
	_actionName: string,
	errorMapping: Map<string, ErrorInfo>,
): string => {
	const calls = getCreateDtoSchemasCalls(source);
	const isCommon = isCommonDto(source.getFilePath());

	if (isCommon) {
		return generateCommonDtoContent(source, moduleName);
	}

	const imports = scanAndTransformImports(source, {
		moduleName,
		isDto: true,
	});

	const content: string[] = [];

	if (imports.length > 0) {
		content.push(...imports);
		content.push('');
	}

	// Add Static import if not present
	if (!imports.some((imp) => imp.includes(ImportNames.Static))) {
		content.push(`import { type ${ImportNames.Static} } from '${PackageNames.Elysia}';`);
		content.push('');
	}

	for (const call of calls) {
		const args = call.getArguments();
		if (args.length < 3) continue;

		const requestArg = args[0];
		const responseArg = args[1];
		const errorsArg = args[2];

		if (requestArg) {
			const requestProperties = extractRequestProperties(requestArg);
			for (const [propName, propValue] of requestProperties) {
				const schemaName = propName === 'params' ? 'param' : propName;
				const typeName = schemaName.charAt(0).toUpperCase() + schemaName.slice(1);
				content.push(`export const ${schemaName}Schema = ${propValue};`);
				content.push(`export type ${typeName} = Static<typeof ${schemaName}Schema>;`);
			}
		}

		if (responseArg) {
			const responseProperties = extractResponseProperties(responseArg);
			for (const [statusCode, schemaValue] of responseProperties) {
				content.push(`export const response${statusCode}Schema = ${schemaValue};`);
				content.push(
					`export type Response${statusCode} = Static<typeof response${statusCode}Schema>;`,
				);
			}
		}

		if (!errorsArg) continue;
		const errorCodes = extractErrorCodes(errorsArg);

		if (errorCodes.length > 0) {
			const errorTypes: string[] = [];
			const errorSchemas: string[] = [];

			for (const errorCode of errorCodes) {
				const detailsSchema = getErrorDetailsSchema(errorCode, errorMapping);

				const schemaVarName = `error${errorCode.replace(/[^a-zA-Z0-9]/g, '')}DetailsSchema`;

				errorSchemas.push(`const ${schemaVarName} = ${detailsSchema};`);

				const codeLiteral = `'${errorCode}'`;
				errorTypes.push(
					`{ error: { path: string; code: ${codeLiteral}; message: string; details: Static<typeof ${schemaVarName}> } }`,
				);
			}

			content.push('');
			content.push(...errorSchemas);
			content.push(`export type Errors = ${errorTypes.join(' | ')};`);
		}
	}

	return content.join('\n');
};

/** Generate Entities file content */
export const generateEntitiesFile = (sources: SourceFile[], moduleName: string): string => {
	const content: string[] = [];
	const allImports = new Set<string>();

	// Collect imports from all entities sources
	for (const source of sources) {
		const imports = scanAndTransformImports(source, {
			moduleName,
			isEntities: true,
		});
		imports.forEach((imp) => allImports.add(imp));
	}

	if (allImports.size > 0) {
		content.push(...Array.from(allImports).sort());
		content.push('');
	}

	// Collect exports from all entities sources
	const allExports: string[] = [];
	for (const source of sources) {
		const exports = scanExports(source);
		const exportTexts = transformExports(exports);
		if (exportTexts.length > 0) {
			allExports.push(...exportTexts);
		}
	}

	if (allExports.length > 0) {
		content.push(allExports.join('\n\n'));
	}

	return content.join('\n');
};

/** Generate Shared utils file content */
export const generateSharedFile = (source: SourceFile): string => {
	const imports = extractSharedImports(source);
	const exports = extractSharedExports(source);

	const content: string[] = [];

	if (imports.length > 0) {
		content.push(...imports);
		content.push('');
	}

	if (exports.length > 0) {
		content.push(exports.join('\n\n'));
	}

	return content.join('\n');
};

/** Generate Shared errors file content */
export const generateSharedErrorsFile = (project: Project, rootDir: string): string | null => {
	const errorsPath = `${rootDir}/${FilePatterns.ErrorsMappingPath}`;

	let errorsSource = project.getSourceFile(errorsPath);

	if (!errorsSource) {
		try {
			errorsSource = project.addSourceFileAtPath(errorsPath);
		} catch {
			const allFiles = project.getSourceFiles();
			errorsSource = allFiles.find((file) => {
				const path = file.getFilePath();
				return path === errorsPath || path.endsWith(FilePatterns.ErrorsMappingPath);
			});
		}
	}

	if (!errorsSource) {
		console.warn(`Cannot find errors.ts file at ${errorsPath}`);
		return null;
	}

	const variableStatements = errorsSource.getVariableStatements();
	const appErrorsVar = variableStatements.find((vs) => {
		const decls = vs.getDeclarationList().getDeclarations();
		return decls.some(
			(decl) => decl.getNameNode()?.getText() === ErrorConstants.AppErrorsVariableName,
		);
	});

	if (!appErrorsVar) {
		console.warn(
			`Cannot find ${ErrorConstants.AppErrorsVariableName} constant in ${errorsSource.getFilePath()}`,
		);
		return null;
	}

	const decl = appErrorsVar
		.getDeclarationList()
		.getDeclarations()
		.find((d) => d.getNameNode()?.getText() === ErrorConstants.AppErrorsVariableName);

	if (!decl) {
		return null;
	}

	const initializer = decl.getInitializer();

	if (!initializer) {
		console.warn(`${ErrorConstants.AppErrorsVariableName} has no initializer`);
		return null;
	}

	// Get the full text of the variable statement, then replace APP_ERRORS with ApiErrors
	let varText = appErrorsVar.getText();

	// Extract type definitions that might be needed (like AppErrorInfo)
	const typeAliases = errorsSource.getTypeAliases();
	const exportedTypes: string[] = [];
	for (const typeAlias of typeAliases) {
		if (typeAlias.isExported()) {
			const typeText = typeAlias.getText();
			// Check if this type is used in APP_ERRORS
			if (varText.includes(typeAlias.getName())) {
				exportedTypes.push(typeText);
			}
		}
	}

	// Extract imports needed for the errors file
	const imports: string[] = [];
	const importDeclarations = errorsSource.getImportDeclarations();

	// Collect all text that might reference imports
	const allText = [varText, ...exportedTypes].join('\n');

	for (const imp of importDeclarations) {
		const specifier = imp.getModuleSpecifierValue();
		const namedImports = imp.getNamedImports();
		const defaultImport = imp.getDefaultImport();
		const namespaceImport = imp.getNamespaceImport();

		// Only include imports that are actually used
		let isUsed = false;

		if (defaultImport) {
			const importName = defaultImport.getText();
			if (allText.includes(importName)) {
				isUsed = true;
			}
		}

		if (namespaceImport) {
			const importName = namespaceImport.getText();
			if (allText.includes(importName)) {
				isUsed = true;
			}
		}

		for (const namedImport of namedImports) {
			const importName = namedImport.getText().replace(/^type\s+/, '');
			if (allText.includes(importName)) {
				isUsed = true;
				break;
			}
		}

		if (isUsed) {
			// Transform the import path
			if (specifier.startsWith(ImportTransforms.SharedPrefix)) {
				const newPath = specifier.replace(
					ImportTransforms.SharedPrefix,
					ImportTransforms.SharedReplacement,
				);
				if (defaultImport) {
					imports.push(`import ${defaultImport.getText()} from '${newPath}';`);
				} else if (namespaceImport) {
					imports.push(`import * as ${namespaceImport.getText()} from '${newPath}';`);
				} else if (namedImports.length > 0) {
					const { typeImports, valueImports } = separateTypeAndValueImports(
						namedImports,
						imp,
					);
					if (typeImports.length > 0) {
						imports.push(
							`import type { ${typeImports.join(', ')} } from '${newPath}';`,
						);
					}
					if (valueImports.length > 0) {
						imports.push(`import { ${valueImports.join(', ')} } from '${newPath}';`);
					}
				}
			} else if (specifier === PackageNames.Elysia || specifier === PackageNames.Typebox) {
				// Keep elysia and typebox imports as-is
				if (namedImports.length > 0) {
					const { typeImports, valueImports } = separateTypeAndValueImports(
						namedImports,
						imp,
					);
					if (typeImports.length > 0) {
						imports.push(
							`import type { ${typeImports.join(', ')} } from '${specifier}';`,
						);
					}
					if (valueImports.length > 0) {
						imports.push(`import { ${valueImports.join(', ')} } from '${specifier}';`);
					}
				}
			}
		}
	}

	// Replace APP_ERRORS with ApiErrors
	varText = varText.replace(
		new RegExp(`\\b${ErrorConstants.AppErrorsVariableName}\\b`, 'g'),
		'ApiErrors',
	);

	const content: string[] = [];

	if (imports.length > 0) {
		content.push(...imports);
		content.push('');
	}

	// Add type definitions first
	if (exportedTypes.length > 0) {
		content.push(...exportedTypes);
		content.push('');
	}

	// Add the variable declaration
	content.push(varText);

	return content.join('\n');
};

/** Generate module index file */
export const generateModuleIndex = (actions: Set<string>): string => {
	const content: string[] = [];
	for (const action of Array.from(actions).sort()) {
		content.push(`export * as ${action} from './${action}';`);
	}
	return content.join('\n');
};

/** Generate main index file */
export const generateMainIndex = (moduleActions: Map<string, Set<string>>): string => {
	const content: string[] = [];
	content.push('// Auto-generated API exports');
	content.push('');
	content.push("export * from './shared/utils';");
	content.push("export * from './shared/errors';");
	content.push('');

	for (const [moduleName, actions] of moduleActions) {
		const pascalModule = toModuleName(moduleName);
		if (actions.size > 0) {
			content.push(`export * as ${pascalModule} from './${pascalModule}';`);
		}
	}

	return content.join('\n');
};
