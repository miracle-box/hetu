// @ts-check

import reactPlugin from '@eslint-react/eslint-plugin';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';

/**
 * React related config
 * @param {{
 *		typeAwareEnabled: boolean;
 *		typeAwareFiles?: string[]
 *		files?: string[],
 *		ignores?: string[],
 *		typeAwareIgnores?: string[],
 *		useNextjs?: boolean,
 * }} options React options
 */
export function react(options) {
	const {
		typeAwareEnabled,
		typeAwareFiles = [],
		files = [],
		ignores = [],
		typeAwareIgnores = [],
		useNextjs = false,
	} = options;

	const allFiles = [...files, ...typeAwareFiles];
	const allIgnores = [...ignores, ...typeAwareIgnores];

	const reactSubPlugins = reactPlugin.configs.all.plugins;

	/** @type {Record<string, import('@typescript-eslint/utils').TSESLint.FlatConfig.RuleEntry>} */
	const rules = {
		...reactSubPlugins['@eslint-react'].configs['recommended'].rules,
		...reactSubPlugins['@eslint-react/dom'].configs['recommended'].rules,
		...reactHooksPlugin.configs.recommended.rules,
		...reactSubPlugins['@eslint-react/hooks-extra'].configs['recommended'].rules,
		...reactSubPlugins['@eslint-react/naming-convention'].configs['recommended'].rules,
		...reactSubPlugins['@eslint-react/web-api'].configs['recommended'].rules,
		...reactRefreshPlugin.configs.recommended.rules,
		...jsxA11yPlugin.flatConfigs.recommended.rules,
	};

	/** @type {Record<string, import('@typescript-eslint/utils').TSESLint.FlatConfig.RuleEntry>} */
	const typeAwareRules = {
		...reactSubPlugins['@eslint-react'].configs['recommended-type-checked'].rules,
	};

	/** @type {Record<string, import('@typescript-eslint/utils').TSESLint.FlatConfig.RuleEntry>} */
	const rulesOverrides = {
		...(useNextjs
			? {
					// Next.js uses these exports
					'react-refresh/only-export-components': [
						'warn',
						{
							allowConstantExport: true,
							allowExportNames: [
								'dynamic',
								'dynamicParams',
								'revalidate',
								'fetchCache',
								'runtime',
								'preferredRegion',
								'maxDuration',
								'config',
								'generateStaticParams',
								'metadata',
								'generateMetadata',
								'viewport',
								'generateViewport',
							],
						},
					],
				}
			: {}),
	};

	/** @type {Record<string, import('@typescript-eslint/utils').TSESLint.FlatConfig.RuleEntry>} */
	const typeAwareRulesOverrides = {};

	/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
	const config = [
		{
			name: '@repo/react/setup',
			plugins: {
				'react-x': reactSubPlugins['@eslint-react'],
				'react-dom': reactSubPlugins['@eslint-react/dom'],
				'react-hooks': reactHooksPlugin,
				'react-hooks-extra': reactSubPlugins['@eslint-react/hooks-extra'],
				'react-naming-convention': reactSubPlugins['@eslint-react/naming-convention'],
				'react-web-api': reactSubPlugins['@eslint-react/web-api'],
				'react-refresh': reactRefreshPlugin,
				'jsx-a11y': jsxA11yPlugin,
			},
		},
		{
			name: '@repo/react/options',
			files: allFiles,
			ignores: allIgnores,
			languageOptions: {
				parserOptions: {
					ecmaFeatures: {
						jsx: true,
					},
				},
				sourceType: 'module',
			},
		},
		{
			name: '@repo/react/rules',
			files: allFiles,
			ignores: allIgnores,
			rules: {
				...rules,
				...rulesOverrides,
			},
		},
		...(typeAwareEnabled && typeAwareFiles.length > 0
			? [
					{
						name: '@repo/react/rules-typeaware',
						files: typeAwareFiles,
						ignores: typeAwareIgnores,
						rules: {
							...rules,
							...typeAwareRules,
							...rulesOverrides,
							...typeAwareRulesOverrides,
						},
					},
				]
			: []),
	];

	return config;
}
