// @ts-check

import jsPlugin from '@eslint/js';
import globals from 'globals';

/**
 * JavaScript related config.
 *
 * @param {{
 * 		files: string[];
 * 		ignoredFiles?: string[];
 * }} options JavaScript options
 */
export function javascript(options) {
	const { files = [], ignoredFiles = [] } = options;

	/** @type {import("eslint").Linter.Config[]} */
	const config = [
		{
			name: '@repo/javascript/setup',
			files,
			ignores: ignoredFiles,
			languageOptions: {
				ecmaVersion: 'latest',
				globals: {
					...globals.browser,
					...globals.es2021,
					...globals.node,
					document: 'readonly',
					navigator: 'readonly',
					window: 'readonly',
				},
				parserOptions: {
					ecmaFeatures: {
						jsx: true,
					},
					ecmaVersion: 'latest',
					sourceType: 'module',
				},
			},
			linterOptions: {
				reportUnusedInlineConfigs: 'error',
				reportUnusedDisableDirectives: true,
			},
		},
		{
			name: '@repo/javascript/rules',
			files,
			ignores: ignoredFiles,
			rules: {
				...jsPlugin.configs.recommended.rules,
			},
		},
	];

	return config;
}
