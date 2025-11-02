import type { SourceFile } from 'ts-morph';
import { SHARED_WHITELIST } from './constants';
import { toModuleName } from './naming';

/** Extract all exports from entities file */
export const extractEntitiesExports = (source: SourceFile): string => {
	const exports: string[] = [];

	const exportedVars = source.getVariableStatements().filter((vs) => vs.isExported());

	for (const varStmt of exportedVars) {
		exports.push(varStmt.getText());
	}

	const exportedTypes = source.getTypeAliases().filter((type) => type.isExported());
	for (const type of exportedTypes) {
		exports.push(type.getText());
	}

	const exportedInterfaces = source.getInterfaces().filter((iface) => iface.isExported());
	for (const iface of exportedInterfaces) {
		exports.push(iface.getText());
	}

	const exportedEnums = source.getEnums().filter((enumDecl) => enumDecl.isExported());

	for (const enumDecl of exportedEnums) {
		exports.push(enumDecl.getText());
	}

	return exports.filter(Boolean).join('\n\n');
};

/** Extract and transform import statements from entities file */
export const extractEntitiesImports = (source: SourceFile): string[] => {
	const imports: string[] = [];

	const importDeclarations = source.getImportDeclarations();

	for (const imp of importDeclarations) {
		const specifier = imp.getModuleSpecifierValue();
		const namedImports = imp.getNamedImports();
		const defaultImport = imp.getDefaultImport();
		const namespaceImport = imp.getNamespaceImport();

		if (
			specifier.startsWith('#shared/') ||
			specifier.startsWith('#modules/') ||
			specifier.startsWith('#common/')
		) {
			if (specifier.includes('shared/typing/utils')) {
				if (namedImports.length > 0) {
					const whitelistImports = namedImports
						.map((n) => n.getText().replace(/^type\s+/, ''))
						.filter((name) => SHARED_WHITELIST.includes(name as any));

					if (whitelistImports.length > 0) {
						const typeImports: string[] = [];
						const valueImports: string[] = [];

						for (const namedImport of namedImports) {
							const text = namedImport.getText();
							const importName = text.replace(/^type\s+/, '');
							if (SHARED_WHITELIST.includes(importName as any)) {
								if (importName === 'EnumLikeValues' || importName === 'Prettify') {
									typeImports.push(importName);
								} else if (importName === 'createEnumLikeValuesSchema') {
									valueImports.push(importName);
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
							imports.push(
								`import type { ${typeImports.join(', ')} } from '../shared/utils';`,
							);
						}
						if (valueImports.length > 0) {
							imports.push(
								`import { ${valueImports.join(', ')} } from '../shared/utils';`,
							);
						}
					}
				}
				continue;
			}

			if (specifier.startsWith('#shared/')) {
				const newPath = specifier.replace('#shared/', '@repo/backend/shared/');
				if (namedImports.length > 0) {
					const typeImports: string[] = [];
					const valueImports: string[] = [];

					for (const namedImport of namedImports) {
						const text = namedImport.getText();
						const isTypeOnly = text.startsWith('type ');
						if (isTypeOnly) {
							typeImports.push(text.replace(/^type\s+/, ''));
						} else {
							valueImports.push(text);
						}
					}

					if (typeImports.length > 0) {
						imports.push(
							`import type { ${typeImports.join(', ')} } from '${newPath}';`,
						);
					}
					if (valueImports.length > 0) {
						imports.push(`import { ${valueImports.join(', ')} } from '${newPath}';`);
					}
				} else if (defaultImport) {
					imports.push(`import ${defaultImport.getText()} from '${newPath}';`);
				} else if (namespaceImport) {
					imports.push(`import * as ${namespaceImport.getText()} from '${newPath}';`);
				}
				continue;
			} else if (specifier.startsWith('#modules/')) {
				const moduleMatch = specifier.match(/#modules\/([^/]+)/);
				if (moduleMatch && moduleMatch[1] && namedImports.length > 0) {
					const importedModule = moduleMatch[1];
					const pascalModule = toModuleName(importedModule);
					imports.push(
						`import { ${namedImports.map((n) => n.getText()).join(', ')} } from '../${pascalModule}/Entities';`,
					);
				}
			}
		} else {
			if (namedImports.length > 0) {
				const typeImports: string[] = [];
				const valueImports: string[] = [];

				for (const namedImport of namedImports) {
					const text = namedImport.getText();
					const importName = text.replace(/^type\s+/, '');
					const isTypeOnly = text.startsWith('type ');

					if (specifier.includes('typebox') && importName === 'Static') {
						typeImports.push(importName);
					} else if (isTypeOnly) {
						typeImports.push(importName);
					} else {
						valueImports.push(text);
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
	}

	return imports;
};
