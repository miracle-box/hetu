// @ts-check

import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importPlugin from 'eslint-plugin-import-x';

/**
 * Import related config
 * @param {{
 *		ignores?: string[]
 *		tsconfig?: string | string[]
 *		confirmMultipleTsconfig?: boolean
 * }} options Import options
 */
export function importLint(options) {
	const { ignores = [], tsconfig, confirmMultipleTsconfig = false } = options;

	/** @type {import("eslint").Linter.Config[]} */
	const config = [
		{
			name: '@repo/import-lint/setup',
			plugins: {
				// @ts-expect-error import-x plugin does not export plugin metadata.
				'import-x': importPlugin.flatConfigs.recommended.plugins['import-x'],
			},
			settings: {
				'import-x/resolver-next': [
					createTypeScriptImportResolver({
						alwaysTryTypes: true,
						// [FIXME] Still have inconsistent behavior between 'bun: true + bun eslint' and 'bun --bun eslint'.
						bun: true,
						project: tsconfig,
						noWarnOnMultipleProjects: confirmMultipleTsconfig,
					}),
				],
			},
		},
		{
			name: '@repo/import-lint/rules',
			ignores,
			rules: {
				...importPlugin.flatConfigs.recommended.rules,
				...importPlugin.flatConfigs.typescript.rules,
				'import-x/no-unresolved': [
					'error',
					{
						// React server-only
						ignore: ['server-only'],
					},
				],
				'import-x/order': [
					'error',
					{
						groups: [
							'type',
							'builtin',
							'external',
							'internal',
							['parent', 'sibling', 'index'],
							'object',
							'unknown',
						],
						'newlines-between': 'ignore',
						alphabetize: { order: 'asc', caseInsensitive: true },
					},
				],
			},
		},
	];

	return config;
}
