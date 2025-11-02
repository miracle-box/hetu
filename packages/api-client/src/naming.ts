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
