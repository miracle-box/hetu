import type { SourceFile } from 'ts-morph';
import { toModuleName } from './naming';

/** Extract entity imports from file (for DTO files) */
export const extractEntitiesImportsForDto = (
	source: SourceFile,
	currentModuleName: string,
): string[] => {
	const imports: string[] = [];
	const entitiesImports = source.getImportDeclarations().filter((imp) => {
		const specifier = imp.getModuleSpecifierValue();
		return (
			(specifier.includes('.entities') || specifier.includes('#modules')) &&
			!specifier.includes('common.dto')
		);
	});

	for (const imp of entitiesImports) {
		const specifier = imp.getModuleSpecifierValue();
		const namedImports = imp.getNamedImports();

		if (namedImports.length === 0) continue;

		const moduleMatch = specifier.match(/#modules\/([^/]+)/);
		if (moduleMatch && moduleMatch[1]) {
			const importedModule = moduleMatch[1];
			const pascalModule = toModuleName(importedModule);
			if (importedModule === currentModuleName) {
				imports.push(
					`import { ${namedImports.map((n) => n.getText()).join(', ')} } from './Entities';`,
				);
			} else {
				imports.push(
					`import { ${namedImports.map((n) => n.getText()).join(', ')} } from '../${pascalModule}/Entities';`,
				);
			}
		}

		if (
			specifier.includes('.entities') &&
			(specifier.startsWith('../') || specifier.startsWith('./'))
		) {
			imports.push(
				`import { ${namedImports.map((n) => n.getText()).join(', ')} } from './Entities';`,
			);
		}
	}

	return imports;
};
