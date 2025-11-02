import type { SourceFile } from 'ts-morph';
import { SHARED_WHITELIST } from './constants';

/** Extract whitelisted functions and types from shared file */
export const extractSharedExports = (source: SourceFile): string => {
	const exports: string[] = [];

	const functions = source.getFunctions();
	for (const func of functions) {
		if (func.isExported() && SHARED_WHITELIST.includes(func.getName() as any)) {
			exports.push(func.getText());
		}
	}

	const typeAliases = source.getTypeAliases();
	for (const typeAlias of typeAliases) {
		if (typeAlias.isExported() && SHARED_WHITELIST.includes(typeAlias.getName() as any)) {
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

	return exports.join('\n\n');
};

/** Extract imports from shared file (only keep dependencies) */
export const extractSharedImports = (source: SourceFile): string[] => {
	const imports: string[] = [];
	const importDeclarations = source.getImportDeclarations();

	const usedImports = new Set<string>();

	const allExports = extractSharedExports(source);
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

		const namedImports = imp.getNamedImports();
		const defaultImport = imp.getDefaultImport();
		const namespaceImport = imp.getNamespaceImport();

		if (namedImports.length > 0) {
			const typeImports: string[] = [];
			const valueImports: string[] = [];

			for (const namedImport of namedImports) {
				const text = namedImport.getText();
				const importName = text.replace(/^type\s+/, '');
				if (allExports.includes(importName)) {
					if (
						specifier.includes('typebox') &&
						(importName === 'TUnion' || importName === 'TLiteral')
					) {
						typeImports.push(importName);
					} else {
						const isTypeOnly = text.startsWith('type ');
						if (isTypeOnly) {
							typeImports.push(importName);
						} else {
							valueImports.push(importName);
						}
					}
				}
			}

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
	}

	return imports;
};
