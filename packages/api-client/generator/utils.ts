import { FilePatterns, PathPatterns } from './constants';

/** Convert kebab-case or snake_case to PascalCase */
export const toPascalCase = (str: string): string => {
	return str
		.split(/[-_]/)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
		.join('');
};

/** Convert module name to PascalCase */
export const toModuleName = (moduleName: string): string => {
	return toPascalCase(moduleName);
};

/** Convert action name to PascalCase */
export const toActionName = (actionName: string): string => {
	if (actionName === 'common') {
		return 'Common';
	}
	return toPascalCase(actionName);
};

/** Extract module and action names from file path */
export const extractModuleAndAction = (
	relativePath: string,
): { moduleName: string; actionName: string } | null => {
	const matches = PathPatterns.DtoPathRegex.exec(relativePath);
	if (!matches || !matches[1] || !matches[2]) return null;

	const moduleName = matches[1];
	const actionName = matches[2];
	return { moduleName, actionName };
};

/** Check if file is common.dto.ts */
export const isCommonDto = (filePath: string): boolean => {
	return filePath.endsWith(FilePatterns.CommonDtoName);
};
