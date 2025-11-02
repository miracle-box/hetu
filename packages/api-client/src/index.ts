import { Project, type SourceFile } from 'ts-morph';
import process from 'node:process';
import { createDtoModulePath, createEntitiesPath } from './paths';
import { toModuleName, toActionName } from './naming';
import { getCreateDtoSchemasCalls } from './dto-extractors';
import { generateDtoFileContent } from './dto-generators';
import { extractEntitiesImports, extractEntitiesExports } from './entities';
import { extractSharedExports, extractSharedImports } from './shared';
import { extractAppErrorsMapping, type ErrorInfo } from './error-mapping';

/** Initialize ts-morph project */
const initializeProject = (): Project => {
	const project = new Project({
		tsConfigFilePath: '../../apps/backend/tsconfig.json',
	});

	return project;
};

/** Organize source files by module */
const organizeByModule = (sources: SourceFile[], rootDir: string): Map<string, SourceFile[]> => {
	return sources.reduce<Map<string, SourceFile[]>>((moduleFiles, source) => {
		const filePath = source.getFilePath();
		const relativePath = filePath.slice(rootDir.length);
		const match = relativePath.match(/^\/modules\/([^/]+)\//);
		const moduleName = match?.[1];
		if (moduleName) {
			const existing = moduleFiles.get(moduleName) ?? [];
			moduleFiles.set(moduleName, [...existing, source]);
		}
		return moduleFiles;
	}, new Map());
};

/** Extract module and action names from file path */
const extractModuleAndAction = (
	relativePath: string,
): { moduleName: string; actionName: string } | null => {
	const matches = /^\/modules\/(.*?)\/dtos\/(?:.*\/)?(.*?)(?:\..+)?\.dto\.ts$/i.exec(
		relativePath,
	);
	if (!matches || !matches[1] || !matches[2]) return null;

	const moduleName = matches[1];
	const actionName = matches[2];
	return { moduleName, actionName };
};

/** Process shared utility files */
const processSharedFiles = (project: Project, rootDir: string): void => {
	const sharedUtilsPath = `${rootDir}/shared/typing/utils.ts`;
	const sharedSource = project.getSourceFile(sharedUtilsPath);

	if (!sharedSource) {
		console.warn('Cannot find shared/typing/utils.ts file');
		return;
	}

	const imports = extractSharedImports(sharedSource);
	const exports = extractSharedExports(sharedSource);

	const content: string[] = [];

	if (imports.length > 0) {
		content.push(...imports);
		content.push('');
	}

	if (exports.trim()) {
		content.push(exports);
	}

	const outputPath = './generated/shared/utils.ts';
	project.createSourceFile(outputPath, content.join('\n'), {
		overwrite: true,
	});
};

/** Process DTO files for a module */
const processModuleDtos = (
	project: Project,
	moduleSources: SourceFile[],
	rootDir: string,
	moduleName: string,
	errorMapping: Map<string, ErrorInfo>,
): void => {
	const dtoSources = moduleSources.filter((source) => source.getFilePath().endsWith('.dto.ts'));

	for (const dtoSource of dtoSources) {
		const relativePath = dtoSource.getFilePath().slice(rootDir.length);
		const pathInfo = extractModuleAndAction(relativePath);
		const dtoCalls = getCreateDtoSchemasCalls(dtoSource);

		if (!pathInfo) continue;

		const isCommon = dtoSource.getFilePath().endsWith('common.dto.ts');
		const actionName = isCommon ? 'common' : pathInfo.actionName;
		const outputPath = createDtoModulePath(moduleName, actionName);

		if (dtoCalls.length > 0 || isCommon) {
			const content = generateDtoFileContent(
				dtoSource,
				dtoCalls,
				moduleName,
				actionName,
				isCommon,
				errorMapping,
			);
			project.createSourceFile(outputPath, content, {
				overwrite: true,
			});
		}
	}
};

/** Process entity files for a module */
const processModuleEntities = (
	project: Project,
	moduleSources: SourceFile[],
	moduleName: string,
): void => {
	const entitiesSources = moduleSources.filter((source) => {
		const fileName = source.getBaseName();
		return fileName.endsWith('.entities.ts') || fileName.includes('.entities');
	});

	if (entitiesSources.length > 0) {
		const outputPath = createEntitiesPath(moduleName);
		const contents: string[] = [];
		const allImports = new Set<string>();

		for (const entitiesSource of entitiesSources) {
			const imports = extractEntitiesImports(entitiesSource);
			imports.forEach((imp) => allImports.add(imp));
		}

		if (allImports.size > 0) {
			contents.push(...Array.from(allImports).sort());
			contents.push('');
		}

		const allExports: string[] = [];
		for (const entitiesSource of entitiesSources) {
			const exports = extractEntitiesExports(entitiesSource);
			if (exports.trim()) {
				allExports.push(exports);
			}
		}

		if (allExports.length > 0) {
			contents.push(allExports.join('\n\n'));
		}

		project.createSourceFile(outputPath, contents.join('\n'), {
			overwrite: true,
		});
	}
};

/** Process all files for a module */
const processModule = (
	project: Project,
	moduleName: string,
	sources: SourceFile[],
	rootDir: string,
	errorMapping: Map<string, ErrorInfo>,
): Set<string> => {
	processModuleDtos(project, sources, rootDir, moduleName, errorMapping);
	processModuleEntities(project, sources, moduleName);

	const actions = new Set<string>();

	const hasEntities = sources.some((source) => source.getFilePath().endsWith('.entities.ts'));
	if (hasEntities) {
		actions.add('Entities');
	}

	const hasCommon = sources.some((source) => source.getFilePath().endsWith('common.dto.ts'));
	if (hasCommon) {
		actions.add('Common');
	}

	const dtoSources = sources.filter((source) => source.getFilePath().endsWith('.dto.ts'));
	for (const dtoSource of dtoSources) {
		const relativePath = dtoSource.getFilePath().slice(rootDir.length);
		const pathInfo = extractModuleAndAction(relativePath);
		if (pathInfo && !dtoSource.getFilePath().endsWith('common.dto.ts')) {
			const actionName = toActionName(pathInfo.actionName);
			actions.add(actionName);
		}
	}

	if (actions.size > 0) {
		const pascalModule = toModuleName(moduleName);
		const content: string[] = [];
		for (const action of Array.from(actions).sort()) {
			content.push(`export * as ${action} from './${action}';`);
		}
		const outputPath = `./generated/${pascalModule}/index.ts`;
		project.createSourceFile(outputPath, content.join('\n'), {
			overwrite: true,
		});
	}

	return actions;
};

/** Main entry point */
const main = (): void => {
	const project = initializeProject();
	const allSources = project.getSourceFiles();

	const indexSource = allSources.find((source) =>
		source.getFilePath().endsWith('/apps/backend/src/index.ts'),
	);
	const rootDir = indexSource?.getDirectoryPath();

	if (!rootDir) {
		console.error('Cannot find backend root directory');
		process.exit(1);
	}

	const backendSources = allSources.filter((source) =>
		source.getDirectoryPath().startsWith(rootDir),
	);
	const modules = organizeByModule(backendSources, rootDir);

	const errorMapping = extractAppErrorsMapping(project, rootDir);

	processSharedFiles(project, rootDir);

	const moduleActions = new Map<string, Set<string>>();
	for (const [moduleName, sources] of modules) {
		const actions = processModule(project, moduleName, sources, rootDir, errorMapping);
		if (actions.size > 0) {
			moduleActions.set(moduleName, actions);
		}
	}

	const content: string[] = [];
	content.push('// Auto-generated API exports');
	content.push('');
	content.push("export * from './shared/utils';");
	content.push('');
	for (const [moduleName, actions] of moduleActions) {
		const pascalModule = toModuleName(moduleName);
		if (actions.size > 0) {
			content.push(`export * as ${pascalModule} from './${pascalModule}';`);
		}
	}
	project.createSourceFile('./generated/index.ts', content.join('\n'), {
		overwrite: true,
	});

	project.saveSync();
};

main();
