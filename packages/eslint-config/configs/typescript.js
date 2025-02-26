// @ts-check

import process from 'node:process';
import tsPlugin from 'typescript-eslint';

/**
 * TypeScript related config.
 *
 * @param {{
 * 		tsconfigPath?: string;
 *		typeAwareFiles?: string[]
 *		files?: string[],
 *		ignoredFiles?: string[],
 *		ignoredTypeAwareFiles?: string[],
 * }} options TypeScript options
 */
export function typescript(options) {
	const {
		tsconfigPath = undefined,
		typeAwareFiles = [],
		files = [],
		ignoredFiles = [],
		ignoredTypeAwareFiles = [],
	} = options;

	const typeAwareEnabled = !!tsconfigPath;
	const allFiles = [...files, ...typeAwareFiles];
	const allIgnoredFiles = [...ignoredFiles, ...ignoredTypeAwareFiles];

	/** @type {Record<string, import('@typescript-eslint/utils').TSESLint.FlatConfig.RuleEntry>} */
	const rules = {
		// Use `recommended` rules for non type aware files
		...(tsPlugin.configs.recommended.find(
			(block) => block.name === 'typescript-eslint/recommended',
		)?.rules ?? {}),

		'@typescript-eslint/no-unused-vars': 'off',
		'no-redeclare': 'off',
	};

	/** @type {Record<string, import('@typescript-eslint/utils').TSESLint.FlatConfig.RuleEntry>} */
	const typeAwareRules = {
		// Plus `recommended-type-checked-only` rules for type aware files
		...(tsPlugin.configs.recommendedTypeCheckedOnly.find(
			(block) => block.name === 'typescript-eslint/recommended-type-checked-only',
		)?.rules ?? {}),
	};

	/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
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
						ignores: allIgnoredFiles,
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
						ignores: allIgnoredFiles,
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
						ignores: ignoredTypeAwareFiles,
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
						ignores: ignoredTypeAwareFiles,
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
