// @ts-check

import process from 'node:process';
import tsPlugin from 'typescript-eslint';

/**
 * TypeScript related config.
 *
 * @param {{
 *		tsconfigPath?: string;
 *		typeAwareFiles?: string[]
 *		files?: string[],
 *		ignores?: string[],
 *		typeAwareIgnores?: string[],
 * }} options TypeScript options
 */
export function typescript(options) {
	const {
		tsconfigPath = undefined,
		typeAwareFiles = [],
		files = [],
		ignores = [],
		typeAwareIgnores = [],
	} = options;

	const typeAwareEnabled = !!tsconfigPath;
	const allFiles = [...files, ...typeAwareFiles];
	const allIgnores = [...ignores, ...typeAwareIgnores];

	/** @type {Record<string, import('@typescript-eslint/utils').TSESLint.FlatConfig.RuleEntry>} */
	const rules = {
		// Use `recommended` rules for non type aware files
		...(tsPlugin.configs.recommended.find(
			(block) => block.name === 'typescript-eslint/recommended',
		)?.rules ?? {}),

		'@typescript-eslint/no-unused-vars': 'off',
		'require-await': 'off',
		'no-redeclare': 'off',
		'no-undef': 'off',
	};

	/** @type {Record<string, import('@typescript-eslint/utils').TSESLint.FlatConfig.RuleEntry>} */
	const typeAwareRules = {
		// Plus `recommended-type-checked-only` rules for type aware files
		...(tsPlugin.configs.recommendedTypeCheckedOnly.find(
			(block) => block.name === 'typescript-eslint/recommended-type-checked-only',
		)?.rules ?? {}),

		'@typescript-eslint/require-await': 'off',
	};

	/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
	const config = [
		{
			name: '@repo/typescript/setup',
			plugins: {
				'@typescript-eslint': tsPlugin.plugin,
			},
		},

		// For non type aware files
		...(allFiles.length > 0
			? [
					{
						name: '@repo/typescript/parser',
						files: allFiles,
						ignores: allIgnores,
						languageOptions: {
							parser: tsPlugin.parser,
							parserOptions: {
								// sourceType types seems can not be resolved correctly.
								/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ParserOptions['sourceType']} */
								sourceType: 'module',
							},
						},
					},
					{
						name: '@repo/typescript/rules',
						files: allFiles,
						ignores: allIgnores,
						rules: {
							...rules,
						},
					},
				]
			: []),

		// For type aware files
		...(typeAwareEnabled && typeAwareFiles.length > 0
			? [
					{
						name: '@repo/typescript/parser-typeaware',
						files: typeAwareFiles,
						ignores: typeAwareIgnores,
						languageOptions: {
							parser: tsPlugin.parser,
							parserOptions: {
								// sourceType types seems can not be resolved correctly.
								/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ParserOptions['sourceType']} */
								sourceType: 'module',
								projectService: {
									allowDefaultProject: ['./*.js'],
									defaultProject: tsconfigPath,
								},
								tsconfigRootDir: process.cwd(),
							},
						},
					},
					{
						name: '@repo/typescript/rules-typeaware',
						files: typeAwareFiles,
						ignores: typeAwareIgnores,
						rules: {
							...rules,
							...typeAwareRules,
						},
					},
				]
			: []),
	];

	return config;
}
