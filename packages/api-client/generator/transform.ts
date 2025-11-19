import type {
	SourceFile,
	ImportDeclaration,
	VariableStatement,
	CallExpression,
	Node,
	ObjectLiteralExpression,
	PropertyAssignment,
	NumericLiteral,
	ArrayLiteralExpression,
	StringLiteral,
	ShorthandPropertyAssignment,
} from 'ts-morph';
import { SyntaxKind, ts } from 'ts-morph';
import {
	WhitelistedIdentifiers,
	FilePatterns,
	ImportTransforms,
	RequestProperties,
	PackageNames,
	ImportPatterns,
	StringPatterns,
	FunctionNames,
} from './constants';
import { toModuleName } from './utils';

/** Transform import specifier path */
const transformImportPath = (specifier: string): string | null => {
	if (specifier.startsWith(ImportTransforms.SharedPrefix)) {
		return specifier.replace(ImportTransforms.SharedPrefix, ImportTransforms.SharedReplacement);
	}
	return null;
};

/** Check if import should be skipped */
const shouldSkipImport = (specifier: string, context?: { isDto?: boolean }): boolean => {
	// Skip dto/schemas imports
	if (specifier.includes(ImportPatterns.DtoSchemasPattern)) {
		return true;
	}

	// Skip relative .entities imports for non-DTO files (handled separately in transformImport for DTO files)
	if (
		!context?.isDto &&
		specifier.includes(ImportPatterns.EntitiesPattern) &&
		(specifier.startsWith('../') || specifier.startsWith('./'))
	) {
		return true;
	}

	return false;
};

/** Transform shared utils import */
const transformSharedUtilsImport = (
	namedImports: Array<{ getText: () => string }>,
): { typeImports: string[]; valueImports: string[] } => {
	const typeImports: string[] = [];
	const valueImports: string[] = [];

	for (const namedImport of namedImports) {
		const text = namedImport.getText();
		const importName = text.replace(/^type\s+/, '');

		if (
			!WhitelistedIdentifiers.includes(importName as (typeof WhitelistedIdentifiers)[number])
		) {
			continue;
		}

		const isTypeOnly = text.startsWith(StringPatterns.TypePrefix);
		if (isTypeOnly) {
			typeImports.push(importName);
		} else {
			valueImports.push(importName);
		}
	}

	return { typeImports, valueImports };
};

/** Transform module import to relative path */
const transformModuleImport = (
	specifier: string,
	currentModuleName: string,
	_isDto: boolean,
): string | null => {
	const moduleMatch = specifier.match(/#modules\/([^/]+)/);
	if (!moduleMatch || !moduleMatch[1]) {
		return null;
	}

	const importedModule = moduleMatch[1];
	const pascalModule = toModuleName(importedModule);

	// Handle DTO imports
	if (_isDto && specifier.includes('/dtos/')) {
		const dtoMatch = specifier.match(/#modules\/([^/]+)\/dtos\/(.+)/);
		if (dtoMatch && dtoMatch[1] === currentModuleName && dtoMatch[2]) {
			const dtoPath = dtoMatch[2];
			if (dtoPath.includes(FilePatterns.CommonDtoName.slice(0, -3))) {
				const pascalCurrentModule = toModuleName(currentModuleName);
				return ImportTransforms.CommonImport(pascalCurrentModule);
			}
		}
	}

	// Handle entities imports
	if (specifier.includes(ImportPatterns.EntitiesPattern)) {
		if (importedModule === currentModuleName) {
			return ImportTransforms.EntitiesImport(pascalModule);
		}
		return ImportTransforms.CrossModuleEntitiesImport(pascalModule);
	}

	return null;
};

/** Separate type and value imports */
const separateTypeAndValueImports = (
	namedImports: Array<{ getText: () => string }>,
	importDeclaration: ImportDeclaration,
): { typeImports: string[]; valueImports: string[] } => {
	const typeImports: string[] = [];
	const valueImports: string[] = [];
	const isTypeOnlyImport = importDeclaration.isTypeOnly();

	for (const namedImport of namedImports) {
		const text = namedImport.getText();
		const importName = text.replace(/^type\s+/, '');
		const isTypeOnly = isTypeOnlyImport || text.startsWith(StringPatterns.TypePrefix);

		if (isTypeOnly) {
			typeImports.push(importName);
		} else {
			valueImports.push(text);
		}
	}

	return { typeImports, valueImports };
};

/** Transform single import declaration to string */
export const transformImport = (
	imp: ImportDeclaration,
	context: {
		moduleName?: string;
		isDto?: boolean;
		isEntities?: boolean;
		isShared?: boolean;
	},
): string[] => {
	const specifier = imp.getModuleSpecifierValue();
	const namedImports = imp.getNamedImports();
	const defaultImport = imp.getDefaultImport();
	const namespaceImport = imp.getNamespaceImport();

	// Skip certain imports
	if (shouldSkipImport(specifier, context)) {
		return [];
	}

	const imports: string[] = [];

	// Handle elysia imports
	if (specifier === PackageNames.Elysia) {
		if (namedImports.length > 0) {
			imports.push(
				`import { ${namedImports.map((n) => n.getText()).join(', ')} } from '${PackageNames.Elysia}';`,
			);
		}
		return imports;
	}

	// Handle typebox imports
	if (specifier === PackageNames.Typebox || specifier.includes(ImportPatterns.TypeboxPattern)) {
		if (namedImports.length > 0) {
			const { typeImports, valueImports } = separateTypeAndValueImports(namedImports, imp);
			if (typeImports.length > 0) {
				imports.push(
					`import type { ${typeImports.join(', ')} } from '${PackageNames.Typebox}';`,
				);
			}
			if (valueImports.length > 0) {
				imports.push(
					`import { ${valueImports.join(', ')} } from '${PackageNames.Typebox}';`,
				);
			}
		}
		return imports;
	}

	// Handle shared utils imports
	if (specifier.includes(FilePatterns.SharedUtilsPath)) {
		if (namedImports.length > 0) {
			const { typeImports, valueImports } = transformSharedUtilsImport(namedImports);
			if (typeImports.length > 0) {
				imports.push(
					`import type { ${typeImports.join(', ')} } from '${ImportTransforms.SharedUtilsImport}';`,
				);
			}
			if (valueImports.length > 0) {
				imports.push(
					`import { ${valueImports.join(', ')} } from '${ImportTransforms.SharedUtilsImport}';`,
				);
			}
		}
		return imports;
	}

	// Handle #shared/ imports
	if (specifier.startsWith(ImportTransforms.SharedPrefix)) {
		// For entities and DTO files, shared/typing/utils should be converted to ../shared/utils
		if (
			(context.isEntities || context.isDto) &&
			specifier.includes(ImportPatterns.SharedUtilsPattern)
		) {
			if (namedImports.length > 0) {
				const { typeImports, valueImports } = transformSharedUtilsImport(namedImports);
				if (typeImports.length > 0) {
					imports.push(
						`import type { ${typeImports.join(', ')} } from '${ImportTransforms.SharedUtilsImport}';`,
					);
				}
				if (valueImports.length > 0) {
					imports.push(
						`import { ${valueImports.join(', ')} } from '${ImportTransforms.SharedUtilsImport}';`,
					);
				}
			}
			return imports;
		}

		// For other #shared/ imports, convert to @repo/backend/shared/
		const newPath = transformImportPath(specifier)!;
		if (defaultImport) {
			imports.push(`import ${defaultImport.getText()} from '${newPath}';`);
		} else if (namespaceImport) {
			imports.push(`import * as ${namespaceImport.getText()} from '${newPath}';`);
		} else if (namedImports.length > 0) {
			const { typeImports, valueImports } = separateTypeAndValueImports(namedImports, imp);
			if (typeImports.length > 0) {
				imports.push(`import type { ${typeImports.join(', ')} } from '${newPath}';`);
			}
			if (valueImports.length > 0) {
				imports.push(`import { ${valueImports.join(', ')} } from '${newPath}';`);
			}
		}
		return imports;
	}

	// Handle #modules/ imports
	if (specifier.startsWith(ImportTransforms.ModulesPrefix) && context.moduleName) {
		const modulePath = transformModuleImport(specifier, context.moduleName, !!context.isDto);
		if (modulePath && namedImports.length > 0) {
			imports.push(
				`import { ${namedImports.map((n) => n.getText()).join(', ')} } from '${modulePath}';`,
			);
		}
		return imports;
	}

	// Handle common.dto imports
	if (specifier.includes(FilePatterns.CommonDtoName.slice(0, -3))) {
		if (namedImports.length > 0 && context.moduleName) {
			const pascalModule = toModuleName(context.moduleName);
			imports.push(
				`import { ${namedImports.map((n) => n.getText()).join(', ')} } from '${ImportTransforms.CommonImport(pascalModule)}';`,
			);
		}
		return imports;
	}

	// Handle entities imports for DTO files
	if (context.isDto && specifier.includes(ImportPatterns.EntitiesPattern)) {
		// Handle relative path entities imports (e.g., ../mc-claims.entities)
		if (
			specifier.includes(ImportPatterns.EntitiesPattern) &&
			(specifier.startsWith('../') || specifier.startsWith('./'))
		) {
			if (namedImports.length > 0 && context.moduleName) {
				const pascalModule = toModuleName(context.moduleName);
				imports.push(
					`import { ${namedImports.map((n) => n.getText()).join(', ')} } from '${ImportTransforms.EntitiesImport(pascalModule)}';`,
				);
			}
			return imports;
		}

		// Handle #modules/ entities imports
		if (specifier.startsWith(ImportTransforms.ModulesPrefix) && context.moduleName) {
			const moduleMatch = specifier.match(/#modules\/([^/]+)/);
			if (moduleMatch && moduleMatch[1]) {
				const importedModule = moduleMatch[1];
				const pascalModule = toModuleName(importedModule);
				const currentPascalModule = toModuleName(context.moduleName);
				if (namedImports.length > 0) {
					if (importedModule === context.moduleName) {
						imports.push(
							`import { ${namedImports.map((n) => n.getText()).join(', ')} } from '${ImportTransforms.EntitiesImport(currentPascalModule)}';`,
						);
					} else {
						imports.push(
							`import { ${namedImports.map((n) => n.getText()).join(', ')} } from '${ImportTransforms.CrossModuleEntitiesImport(pascalModule)}';`,
						);
					}
				}
			}
		}
		return imports;
	}

	// Handle entities imports for entities files
	if (context.isEntities && specifier.startsWith(ImportTransforms.ModulesPrefix)) {
		const moduleMatch = specifier.match(/#modules\/([^/]+)/);
		if (moduleMatch && moduleMatch[1] && namedImports.length > 0) {
			const importedModule = moduleMatch[1];
			const pascalModule = toModuleName(importedModule);
			imports.push(
				`import { ${namedImports.map((n) => n.getText()).join(', ')} } from '${ImportTransforms.CrossModuleEntitiesImport(pascalModule)}';`,
			);
		}
		return imports;
	}

	// Handle other imports (external packages)
	if (namedImports.length > 0) {
		const { typeImports, valueImports } = separateTypeAndValueImports(namedImports, imp);
		if (typeImports.length > 0) {
			imports.push(`import type { ${typeImports.join(', ')} } from '${specifier}';`);
		}
		if (valueImports.length > 0) {
			imports.push(`import { ${valueImports.join(', ')} } from '${specifier}';`);
		}
	} else if (defaultImport) {
		imports.push(`import ${defaultImport.getText()} from '${specifier}';`);
	} else if (namespaceImport) {
		imports.push(`import * as ${namespaceImport.getText()} from '${specifier}';`);
	}

	return imports;
};

/** Scan and transform all imports from a source file */
export const scanAndTransformImports = (
	source: SourceFile,
	context: {
		moduleName?: string;
		isDto?: boolean;
		isEntities?: boolean;
		isShared?: boolean;
	},
): string[] => {
	const imports: string[] = [];
	const importDeclarations = source.getImportDeclarations();

	for (const imp of importDeclarations) {
		const transformed = transformImport(imp, context);
		imports.push(...transformed);
	}

	// Remove duplicates
	return Array.from(new Set(imports));
};

/** Scan all exports from a source file */
export const scanExports = (
	source: SourceFile,
): {
	variables: VariableStatement[];
	types: ReturnType<SourceFile['getTypeAliases']>;
	interfaces: ReturnType<SourceFile['getInterfaces']>;
	enums: ReturnType<SourceFile['getEnums']>;
} => {
	return {
		variables: source.getVariableStatements().filter((vs) => vs.isExported()),
		types: source.getTypeAliases().filter((type) => type.isExported()),
		interfaces: source.getInterfaces().filter((iface) => iface.isExported()),
		enums: source.getEnums().filter((enumDecl) => enumDecl.isExported()),
	};
};

/** Transform exports to string array */
export const transformExports = (exports: {
	variables: VariableStatement[];
	types: ReturnType<SourceFile['getTypeAliases']>;
	interfaces: ReturnType<SourceFile['getInterfaces']>;
	enums: ReturnType<SourceFile['getEnums']>;
}): string[] => {
	const result: string[] = [];

	for (const varStmt of exports.variables) {
		result.push(varStmt.getText());
	}

	for (const type of exports.types) {
		result.push(type.getText());
	}

	for (const iface of exports.interfaces) {
		result.push(iface.getText());
	}

	for (const enumDecl of exports.enums) {
		result.push(enumDecl.getText());
	}

	return result;
};

/** Extract createDtoSchemas calls from DTO file */
export const getCreateDtoSchemasCalls = (
	source: SourceFile,
): CallExpression<ts.CallExpression>[] => {
	return source
		.getVariableStatements()
		.filter((vs) => vs.isExported())
		.flatMap((vs) =>
			vs
				.getDeclarationList()
				.getDeclarations()
				.map((decl) => decl.getInitializerIfKind(SyntaxKind.CallExpression))
				.filter(
					(expr) =>
						expr?.getFirstChildByKind(SyntaxKind.Identifier)?.getText() ===
						FunctionNames.CreateDtoSchemas,
				),
		)
		.filter((expr): expr is CallExpression<ts.CallExpression> => !!expr);
};

/** Extract request properties (body, params, query, cookie, headers) */
export const extractRequestProperties = (requestArg: Node): Map<string, string> => {
	const properties = new Map<string, string>();

	if (requestArg.getKind() === SyntaxKind.ObjectLiteralExpression) {
		const objLiteral = requestArg as ObjectLiteralExpression;

		for (const prop of objLiteral.getProperties()) {
			let propName: string | null = null;
			let propValue: string | null = null;

			if (prop.getKind() === SyntaxKind.PropertyAssignment) {
				const propAssign = prop as PropertyAssignment;
				const nameNode = propAssign.getNameNode();
				propName = nameNode.getText();
				propValue = propAssign.getInitializerOrThrow().getText();
			} else if (prop.getKind() === SyntaxKind.ShorthandPropertyAssignment) {
				const shorthandProp = prop as ShorthandPropertyAssignment;
				propName = shorthandProp.getName();
				propValue = propName;
			}

			if (
				propName &&
				propValue &&
				RequestProperties.includes(propName as (typeof RequestProperties)[number])
			) {
				properties.set(propName, propValue);
			}
		}
	}

	return properties;
};

/** Extract status codes and corresponding schemas from response object */
export const extractResponseProperties = (responseArg: Node): Map<number, string> => {
	const responses = new Map<number, string>();

	if (responseArg.getKind() === SyntaxKind.ObjectLiteralExpression) {
		const objLiteral = responseArg as ObjectLiteralExpression;

		for (const prop of objLiteral.getProperties()) {
			if (prop.getKind() === SyntaxKind.PropertyAssignment) {
				const propAssign = prop as PropertyAssignment;
				const nameNode = propAssign.getNameNode();

				if (nameNode.getKind() === SyntaxKind.NumericLiteral) {
					const numericLiteral = nameNode as NumericLiteral;
					const statusCode = parseInt(numericLiteral.getText(), 10);
					const schemaValue = propAssign.getInitializerOrThrow().getText();
					responses.set(statusCode, schemaValue);
				}
			}
		}
	}

	return responses;
};

/** Extract error code array */
export const extractErrorCodes = (errorsArg: Node): string[] => {
	const errorCodes: string[] = [];

	if (errorsArg.getKind() === SyntaxKind.ArrayLiteralExpression) {
		const arrayLiteral = errorsArg as ArrayLiteralExpression;

		for (const element of arrayLiteral.getElements()) {
			if (element.getKind() === SyntaxKind.StringLiteral) {
				const stringLiteral = element as StringLiteral;
				errorCodes.push(stringLiteral.getText().replace(/['"]/g, ''));
			}
		}
	}

	return errorCodes;
};

/** Extract shared exports (whitelisted only) */
export const extractSharedExports = (source: SourceFile): string[] => {
	const exports: string[] = [];

	const functions = source.getFunctions();
	for (const func of functions) {
		if (
			func.isExported() &&
			WhitelistedIdentifiers.includes(
				func.getName() as (typeof WhitelistedIdentifiers)[number],
			)
		) {
			exports.push(func.getText());
		}
	}

	const typeAliases = source.getTypeAliases();
	for (const typeAlias of typeAliases) {
		if (
			typeAlias.isExported() &&
			WhitelistedIdentifiers.includes(
				typeAlias.getName() as (typeof WhitelistedIdentifiers)[number],
			)
		) {
			exports.push(typeAlias.getText());
		}
	}

	// Extract internal types used by exported types/functions
	const internalTypes = source.getTypeAliases().filter((type) => !type.isExported());
	for (const type of internalTypes) {
		const typeName = type.getName();
		const allExportsText = exports.join('\n');
		if (allExportsText.includes(typeName)) {
			exports.unshift(type.getText());
		}
	}

	return exports;
};

/** Extract shared imports (only dependencies of exports) */
export const extractSharedImports = (source: SourceFile): string[] => {
	const imports: string[] = [];
	const importDeclarations = source.getImportDeclarations();

	const usedImports = new Set<string>();
	const allExports = extractSharedExports(source).join('\n');

	for (const imp of importDeclarations) {
		const specifier = imp.getModuleSpecifierValue();
		const namedImports = imp.getNamedImports();

		for (const namedImport of namedImports) {
			const importName = namedImport.getText().replace(/^type\s+/, '');
			if (allExports.includes(importName)) {
				usedImports.add(specifier);
				break;
			}
		}
	}

	for (const imp of importDeclarations) {
		const specifier = imp.getModuleSpecifierValue();
		if (!usedImports.has(specifier)) continue;

		const transformed = transformImport(imp, { isShared: true });
		imports.push(...transformed);
	}

	return imports;
};
