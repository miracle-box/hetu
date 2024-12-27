const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: ['eslint:recommended', 'plugin:drizzle/recommended', 'prettier', 'turbo'],
	plugins: ['only-warn', 'drizzle'],
	env: {
		node: true,
	},
	globals: {
		Bun: false,
	},
	settings: {
		'import/resolver': {
			typescript: {
				project,
			},
		},
	},
	ignorePatterns: [
		// Ignore dotfiles
		'.*.js',
		'node_modules/',
		'dist/',
	],
	rules: {
		'no-unused-vars': 'off',
		'no-redeclare': 'off',
		'drizzle/enforce-delete-with-where': [
			'error',
			{
				drizzleObjectName: ['db'],
			},
		],
	},
	overrides: [
		{
			files: ['*.js?(x)', '*.ts?(x)'],
		},
	],
};
