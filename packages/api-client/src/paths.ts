import { toModuleName, toActionName } from './naming';

/** Create DTO module output path */
export const createDtoModulePath = (moduleName: string, actionName: string): string => {
	const pascalModule = toModuleName(moduleName);
	const pascalAction = toActionName(actionName);
	return `./generated/${pascalModule}/${pascalAction}.ts`;
};

/** Create entities output path */
export const createEntitiesPath = (moduleName: string): string => {
	const pascalModule = toModuleName(moduleName);
	return `./generated/${pascalModule}/Entities.ts`;
};

/** Check if file is common.dto.ts */
export const isCommonDto = (filePath: string): boolean => {
	return filePath.endsWith('common.dto.ts');
};
