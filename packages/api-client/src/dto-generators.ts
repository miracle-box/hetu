import type { SourceFile, CallExpression } from 'ts-morph';
import { ts } from 'ts-morph';
import { extractDtoImports } from './dto-imports';
import {
	extractRequestProperties,
	extractResponseProperties,
	extractErrorCodes,
} from './dto-extractors';
import { getErrorDetailsSchema, type ErrorInfo } from './error-mapping';

/** Generate Common DTO file content with dependency sorting */
const generateCommonDtoContent = (source: SourceFile, moduleName: string): string => {
	const imports = extractDtoImports(source, moduleName);

	const content: string[] = [];

	if (imports.length > 0) {
		content.push(...imports);
		content.push('');
	}

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

	const exportedUsedByPrivate = new Set<string>();
	for (const [, varText] of privateVarMap) {
		for (const exportedVarName of exportedVarNames) {
			if (varText.includes(exportedVarName)) {
				exportedUsedByPrivate.add(exportedVarName);
			}
		}
	}

	const earlyExports: string[] = [];
	const lateExports: string[] = [];
	for (const exportedText of sortedExportedVars) {
		const isEarly = Array.from(exportedUsedByPrivate).some(
			(name) =>
				exportedText.includes(`export const ${name}`) ||
				exportedText.includes(`export const ${name} =`),
		);
		if (isEarly) {
			earlyExports.push(exportedText);
		} else {
			lateExports.push(exportedText);
		}
	}

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
export const generateDtoFileContent = (
	source: SourceFile,
	calls: CallExpression<ts.CallExpression>[],
	moduleName: string,
	_actionName: string,
	isCommon: boolean,
	errorMapping: Map<string, ErrorInfo>,
): string => {
	const imports = extractDtoImports(source, moduleName);

	if (isCommon) {
		return generateCommonDtoContent(source, moduleName);
	}

	const content: string[] = [];

	if (imports.length > 0) {
		content.push(...imports);
		content.push('');
	}

	if (!imports.some((imp) => imp.includes('Static'))) {
		content.push("import { type Static } from 'elysia';");
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
				content.push(`export const ${schemaName}Schema = ${propValue};`);
				content.push(
					`export type ${schemaName.charAt(0).toUpperCase() + schemaName.slice(1)} = Static<typeof ${schemaName}Schema>;`,
				);
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
