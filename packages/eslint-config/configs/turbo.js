// @ts-check

import turboPlugin from 'eslint-plugin-turbo';

/**
 * Turborepo related config
 * @param {{
 *		ignores?: string[]
 * }} options Turbo options
 */
export function turbo(options) {
	const { ignores = [] } = options;

	/** @type {import("eslint").Linter.Config[]} */
	const config = [
		{
			name: '@repo/turbo/setup',
			plugins: {
				turbo: turboPlugin,
			},
		},
		{
			name: '@repo/turbo/rules',
			ignores,
			rules: {
				'turbo/no-undeclared-env-vars': 'error',
			},
		},
	];

	return config;
}
