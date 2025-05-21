// @ts-check

import * as configs from '@repo/eslint-config/configs';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
	// Global ignores
	{
		ignores: ['apps/backend/dist/**/*', 'apps/web/.next/**/*'],
	},

	// All JavaScript
	...configs.javascript({
		files: ['**/*'],
	}),

	// Backend
	...configs.typescript({
		tsconfigPath: 'apps/backend/tsconfig.json',
		typeAwareFiles: ['apps/backend/**/*.?([cm])ts'],
	}),
	...configs.drizzle({
		files: ['apps/backend/src/**/*'],
		drizzleObjectName: 'db',
	}),

	// Web
	...configs.typescript({
		tsconfigPath: 'apps/web/tsconfig.json',
		typeAwareFiles: ['apps/web/**/*.?([cm])ts', 'apps/web/**/*.?([cm])tsx'],
	}),
	...configs.react({
		typeAwareEnabled: true,
		files: ['apps/web/**/*'],
		typeAwareFiles: ['apps/web/**/*.?([cm])ts', 'apps/web/**/*.?([cm])tsx'],
		useNextjs: true,
	}),
	...configs.next({
		rootDir: 'apps/web',
		files: ['apps/web/**/*'],
	}),

	// miniclap
	...configs.typescript({
		tsconfigPath: 'packages/miniclap/tsconfig.json',
		files: ['packages/miniclap/**/*.?([cm])ts'],
	}),

	// pino-pretty-transport
	...configs.typescript({
		tsconfigPath: 'packages/pino-pretty-transport/tsconfig.json',
		// pino-pretty does not have complete type declarations
		files: ['packages/pino-pretty-transport/**/*.?([cm])ts'],
	}),

	// ui
	...configs.typescript({
		tsconfigPath: 'packages/ui/tsconfig.lint.json',
		files: ['packages/ui/**/*.?([cm])ts'],
		typeAwareFiles: ['packages/ui/src/**/*.?([cm])ts', 'packages/ui/src/**/*.?([cm])tsx'],
	}),
	...configs.react({
		typeAwareEnabled: true,
		files: ['packages/ui/**/*'],
		typeAwareFiles: ['packages/ui/src/**/*.?([cm])ts', 'packages/ui/src/**/*.?([cm])tsx'],
	}),

	// Import
	...configs.importLint({
		// Using a single TSConfig with references resolves import resolution problems.
		tsconfig: 'tsconfig.lint.json',
	}),
	// Turborepo
	...configs.turbo({}),
];
