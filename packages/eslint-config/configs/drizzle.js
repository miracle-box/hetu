// @ts-check

import * as drizzlePlugin from 'eslint-plugin-drizzle';

/**
 * Drizzle ORM related config
 * @param {{
 *		drizzleObjectName: string | string[],
 *		files: string[]
 *		ignores?: string[]
 * }} options Drizzle options
 */
export function drizzle(options) {
	const { files = [], ignores = [], drizzleObjectName } = options;

	/** @type {import("eslint").Linter.Config[]} */
	const config = [
		{
			name: '@repo/drizzle/setup',
			plugins: {
				drizzle: drizzlePlugin,
			},
		},
		{
			name: '@repo/drizzle/rules',
			files,
			ignores,
			rules: {
				'drizzle/enforce-delete-with-where': [
					'error',
					{
						drizzleObjectName,
					},
				],
				'drizzle/enforce-update-with-where': [
					'error',
					{
						drizzleObjectName,
					},
				],
			},
		},
	];

	return config;
}
