import { Project, SourceFile, SyntaxKind } from 'ts-morph';
import process from 'node:process';
import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
	FilePatterns,
	PathPatterns,
	OutputPaths,
	FunctionNames,
	ImportPatterns,
	TSConfigPath,
} from './constants';
import { extractModuleAndAction, toModuleName, toActionName, isCommonDto } from './utils';
import {
	extractAppErrorsMapping,
	generateDtoFile,
	generateEntitiesFile,
	generateSharedFile,
	generateSharedErrorsFile,
	generateModuleIndex,
	generateMainIndex,
} from './generate';
import { logger } from './logger';
import { fixVerbatimModuleSyntax } from './fix-verbatim';

/** Initialize ts-morph project */
const initializeProject = (): Project => {
	const project = new Project({
		tsConfigFilePath: TSConfigPath,
	});

	return project;
};

/** Group source files by module */
const groupFilesByModule = (sources: SourceFile[], rootDir: string): Map<string, SourceFile[]> => {
	return sources.reduce<Map<string, SourceFile[]>>((moduleFiles, source) => {
		const filePath = source.getFilePath();
		const relativePath = filePath.slice(rootDir.length);
		const match = relativePath.match(PathPatterns.ModuleRegex);
		const moduleName = match?.[1];
		if (moduleName) {
			const existing = moduleFiles.get(moduleName) ?? [];
			moduleFiles.set(moduleName, [...existing, source]);
		}
		return moduleFiles;
	}, new Map());
};

/** Process shared utility files */
const processSharedFiles = (project: Project, rootDir: string): void => {
	const sharedUtilsPath = `${rootDir}/${FilePatterns.SharedUtilsPath}`;
	const sharedSource = project.getSourceFile(sharedUtilsPath);

	if (!sharedSource) {
		console.warn(`Cannot find ${FilePatterns.SharedUtilsPath} file`);
		return;
	}

	let content = generateSharedFile(sharedSource);
	content = fixVerbatimModuleSyntax(content);
	project.createSourceFile(OutputPaths.SharedUtils, content, {
		overwrite: true,
	});
};

/** Process shared errors file */
const processSharedErrors = (project: Project, rootDir: string): void => {
	let content = generateSharedErrorsFile(project, rootDir);

	if (content) {
		content = fixVerbatimModuleSyntax(content);
		project.createSourceFile(OutputPaths.SharedErrors, content, {
			overwrite: true,
		});
		logger.incrementFiles(1); // shared/errors.ts
	}
};

/** Process DTO files for a module */
const processModuleDtos = (
	project: Project,
	moduleSources: SourceFile[],
	rootDir: string,
	moduleName: string,
	errorMapping: Map<string, { status: number; detailsSchemaText: string }>,
): void => {
	const dtoSources = moduleSources.filter((source) =>
		source.getFilePath().endsWith(FilePatterns.DtoExtension),
	);

	for (const dtoSource of dtoSources) {
		const relativePath = dtoSource.getFilePath().slice(rootDir.length);
		const pathInfo = extractModuleAndAction(relativePath);
		const calls = dtoSource
			.getVariableStatements()
			.filter((vs) => vs.isExported())
			.some((vs) =>
				vs
					.getDeclarationList()
					.getDeclarations()
					.some(
						(decl) =>
							decl
								.getInitializerIfKind(SyntaxKind.CallExpression)
								?.getFirstChildByKind(SyntaxKind.Identifier)
								?.getText() === FunctionNames.CreateDtoSchemas,
					),
			);

		if (!pathInfo && !isCommonDto(dtoSource.getFilePath())) continue;

		const isCommon = isCommonDto(dtoSource.getFilePath());
		const actionName = isCommon ? 'common' : pathInfo!.actionName;
		const pascalModule = toModuleName(moduleName);
		const pascalAction = toActionName(actionName);
		const outputPath = OutputPaths.DtoModule(pascalModule, pascalAction);

		// Generate file if it has createDtoSchemas calls or is common.dto
		if (calls || isCommon) {
			let content = generateDtoFile(dtoSource, moduleName, actionName, errorMapping);
			content = fixVerbatimModuleSyntax(content);
			project.createSourceFile(outputPath, content, {
				overwrite: true,
			});
			logger.incrementFiles(1);
			logger.debug(`  Generated ${pascalModule}/${pascalAction}.ts`);
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
		return (
			fileName.endsWith(FilePatterns.EntitiesExtension) ||
			fileName.includes(ImportPatterns.EntitiesPattern)
		);
	});

	if (entitiesSources.length > 0) {
		const pascalModule = toModuleName(moduleName);
		const outputPath = OutputPaths.EntitiesModule(pascalModule);
		let content = generateEntitiesFile(entitiesSources, moduleName);
		content = fixVerbatimModuleSyntax(content);
		project.createSourceFile(outputPath, content, {
			overwrite: true,
		});
		logger.incrementFiles(1);
		logger.debug(`  Generated ${pascalModule}/Entities.ts`);
	}
};

/** Process all files for a module */
const processModule = (
	project: Project,
	moduleName: string,
	sources: SourceFile[],
	rootDir: string,
	errorMapping: Map<string, { status: number; detailsSchemaText: string }>,
): Set<string> => {
	processModuleDtos(project, sources, rootDir, moduleName, errorMapping);
	processModuleEntities(project, sources, moduleName);

	const actions = new Set<string>();

	const hasEntities = sources.some((source) =>
		source.getFilePath().endsWith(FilePatterns.EntitiesExtension),
	);
	if (hasEntities) {
		actions.add('Entities');
	}

	const hasCommon = sources.some((source) =>
		source.getFilePath().endsWith(FilePatterns.CommonDtoName),
	);
	if (hasCommon) {
		actions.add('Common');
	}

	const dtoSources = sources.filter((source) =>
		source.getFilePath().endsWith(FilePatterns.DtoExtension),
	);
	for (const dtoSource of dtoSources) {
		const relativePath = dtoSource.getFilePath().slice(rootDir.length);
		const pathInfo = extractModuleAndAction(relativePath);
		if (pathInfo && !isCommonDto(dtoSource.getFilePath())) {
			const actionName = toActionName(pathInfo.actionName);
			actions.add(actionName);
		}
	}

	if (actions.size > 0) {
		const pascalModule = toModuleName(moduleName);
		let content = generateModuleIndex(actions);
		content = fixVerbatimModuleSyntax(content);
		const outputPath = OutputPaths.ModuleIndex(pascalModule);
		project.createSourceFile(outputPath, content, {
			overwrite: true,
		});
		logger.incrementFiles(1);
		logger.debug(`  Generated ${pascalModule}/index.ts`);
	}

	return actions;
};

/** Clean generated directory */
const cleanGenerated = (): void => {
	const generatedDir = join(process.cwd(), 'generated');
	if (existsSync(generatedDir)) {
		rmSync(generatedDir, { recursive: true, force: true });
		logger.info('Generated directory cleaned');
	}
};

/** Main entry point */
export const main = (): void => {
	logger.reset();

	try {
		// Clean old files before generating
		cleanGenerated();

		const project = initializeProject();
		const allSources = project.getSourceFiles();
		logger.debug(`Found ${allSources.length} source files`);

		const indexSource = allSources.find((source) =>
			source.getFilePath().endsWith(FilePatterns.BackendIndexPath),
		);
		const rootDir = indexSource?.getDirectoryPath();

		if (!rootDir) {
			logger.error('Cannot find backend root directory');
			process.exit(1);
		}

		logger.debug(`Backend root directory: ${rootDir}`);

		const backendSources = allSources.filter((source) =>
			source.getDirectoryPath().startsWith(rootDir),
		);
		const modules = groupFilesByModule(backendSources, rootDir);

		logger.debug(`Found ${modules.size} module(s)`);

		const errorMapping = extractAppErrorsMapping(project, rootDir);
		logger.debug(`Found ${errorMapping.size} error mapping(s)`);

		processSharedFiles(project, rootDir);
		logger.incrementFiles(1); // shared/utils.ts

		processSharedErrors(project, rootDir);

		const moduleActions = new Map<string, Set<string>>();
		for (const [moduleName, sources] of modules) {
			logger.debug(`Processing module: ${moduleName}`);
			const actions = processModule(project, moduleName, sources, rootDir, errorMapping);
			if (actions.size > 0) {
				moduleActions.set(moduleName, actions);
				logger.debug(`  Generated ${actions.size} action(s) for ${moduleName}`);
			}
		}

		let content = generateMainIndex(moduleActions);
		content = fixVerbatimModuleSyntax(content);
		project.createSourceFile(OutputPaths.Index, content, {
			overwrite: true,
		});
		logger.incrementFiles(1); // index.ts

		project.saveSync();

		logger.printStats();
	} catch (error) {
		logger.error('Generation failed', error);
		process.exit(1);
	}
};

// Only run if this file is executed directly (not imported)
if (import.meta.main) {
	main();
}
