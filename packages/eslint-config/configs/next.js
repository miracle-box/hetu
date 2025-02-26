// @ts-check

import nextPlugin from '@next/eslint-plugin-next';

/**
 * Next.js related config
 * @param {{
 *		rootDir: string,
 *		files: string[],
 *		ignores?: string[]
 * }} options Next.js options
 */
export function next(options) {
	const { rootDir, files, ignores = [] } = options;

	/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
	const config = [
		{
			name: '@repo/next/setup',
			plugins: {
				'@next/next': nextPlugin,
			},
		},
		{
			name: '@repo/next/options',
			files,
			ignores,
			settings: {
				next: {
					rootDir,
				},
			},
		},
		{
			name: '@repo/next/rules',
			files,
			ignores,
			// @ts-expect-error Next.js ESLint plugin does not have correct type declarations
			rules: {
				...nextPlugin.configs.recommended.rules,
				...nextPlugin.configs['core-web-vitals'].rules,
			},
		},
	];

	return config;
}
