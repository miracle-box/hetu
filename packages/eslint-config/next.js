const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: [
		'eslint:recommended',
		'prettier',
		require.resolve('@vercel/style-guide/eslint/next'),
		'plugin:@tanstack/query/recommended',
		'turbo',
	],
	globals: {
		React: true,
		JSX: true,
		Bun: false,
	},
	env: {
		node: true,
		browser: true,
	},
	plugins: ['only-warn'],
	settings: {
		'import/resolver': {
			typescript: {
				project,
			},
		},
	},
	rules: {
		'no-unused-vars': 'off',
		'no-redeclare': 'off',
	},
	ignorePatterns: [
		// Ignore dotfiles
		'.*.js',
		'node_modules/',
	],
	overrides: [{ files: ['*.js?(x)', '*.ts?(x)'] }],
};
