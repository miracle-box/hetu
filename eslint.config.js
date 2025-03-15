// @ts-check

import * as configs from '@repo/eslint-config/configs';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
	// All JavaScript
	...configs.javascript({
		files: ['**/*'],
		ignores: ['apps/backend/dist/**/*', 'apps/web/.next/**/*'],
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
		typeAwareIgnores: ['apps/web/.next/**/*'],
	}),
	...configs.react({
		typeAwareEnabled: true,
		files: ['apps/web/**/*'],
		typeAwareFiles: ['apps/web/**/*.?([cm])ts', 'apps/web/**/*.?([cm])tsx'],
		typeAwareIgnores: ['apps/web/.next/**/*'],
		useNextjs: true,
	}),
	...configs.next({
		rootDir: 'apps/web',
		files: ['apps/web/**/*'],
		ignores: ['apps/web/.next/**/*'],
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

	// typebox-form-adapter
	...configs.typescript({
		tsconfigPath: 'packages/typebox-form-adapter/tsconfig.json',
		files: ['packages/typebox-form-adapter/**/*.?([cm])ts'],
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
		ignores: ['apps/backend/dist/**/*', 'apps/web/.next/**/*'],
		tsconfigs: ['packages/*/tsconfig.json', 'apps/*/tsconfig.json'],
	}),
	// Turborepo
	...configs.turbo({
		ignores: ['apps/backend/dist/**/*', 'apps/web/.next/**/*'],
	}),
];
