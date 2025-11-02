import type { SourceFile } from 'ts-morph';
import { SHARED_WHITELIST } from './constants';
import { extractEntitiesImportsForDto } from './entities-imports';

/** Extract import statements from DTO file */
export const extractDtoImports = (source: SourceFile, moduleName: string): string[] => {
	const imports: string[] = [];

	const importDeclarations = source.getImportDeclarations();

	for (const imp of importDeclarations) {
		const specifier = imp.getModuleSpecifierValue();
		const namedImports = imp.getNamedImports();
		const defaultImport = imp.getDefaultImport();
		const namespaceImport = imp.getNamespaceImport();

		if (specifier.includes('.entities')) {
			if (!specifier.startsWith('#modules/')) {
				continue;
			}
		}

		if (specifier.includes('dto/schemas')) {
			continue;
		}

		if (specifier === 'elysia') {
			if (namedImports.length > 0) {
				imports.push(
					`import { ${namedImports.map((n) => n.getText()).join(', ')} } from 'elysia';`,
				);
			}
			continue;
		}

		if (specifier === '@sinclair/typebox' || specifier.includes('typebox')) {
			if (namedImports.length > 0) {
				imports.push(
					`import { ${namedImports.map((n) => n.getText()).join(', ')} } from '@sinclair/typebox';`,
				);
			}
			continue;
		}

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
			if (defaultImport) {
				imports.push(`import ${defaultImport.getText()} from '${newPath}';`);
			} else if (namespaceImport) {
				imports.push(`import * as ${namespaceImport.getText()} from '${newPath}';`);
			} else if (namedImports.length > 0) {
				imports.push(
					`import { ${namedImports.map((n) => n.getText()).join(', ')} } from '${newPath}';`,
				);
			}
			continue;
		}

		if (
			specifier.includes('.entities') &&
			(specifier.startsWith('../') || specifier.startsWith('./'))
		) {
			continue;
		}

		if (specifier.startsWith('#modules/')) {
			const moduleMatch = specifier.match(/#modules\/([^/]+)\/dtos\/(.+)/);
			if (moduleMatch && moduleMatch[1] === moduleName && moduleMatch[2]) {
				const dtoPath = moduleMatch[2];
				if (dtoPath.includes('common.dto')) {
					if (namedImports.length > 0) {
						imports.push(
							`import { ${namedImports.map((n) => n.getText()).join(', ')} } from './Common';`,
						);
					}
					continue;
				}
			}
		}

		if (specifier.includes('common.dto')) {
			if (namedImports.length > 0) {
				imports.push(
					`import { ${namedImports.map((n) => n.getText()).join(', ')} } from './Common';`,
				);
			}
			continue;
		}
	}

	const entityImports = extractEntitiesImportsForDto(source, moduleName);
	imports.push(...entityImports);

	for (const imp of importDeclarations) {
		const specifier = imp.getModuleSpecifierValue();
		const namedImports = imp.getNamedImports();

		if (specifier.startsWith('#modules/')) {
			const moduleMatch = specifier.match(/#modules\/([^/]+)\/dtos\/(.+)/);
			if (moduleMatch && moduleMatch[1] === moduleName && moduleMatch[2]) {
				const dtoPath = moduleMatch[2];
				if (dtoPath.includes('common.dto') && namedImports.length > 0) {
					const importText = `import { ${namedImports.map((n) => n.getText()).join(', ')} } from './Common';`;
					if (!imports.includes(importText)) {
						imports.push(importText);
					}
				}
			}
		}
	}

	return imports;
};
