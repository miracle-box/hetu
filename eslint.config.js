// @ts-check

import * as configs from '@repo/eslint-config/configs';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
	// Backend
	...configs.javascript({
		files: ['apps/backend/**/*'],
		ignores: ['apps/backend/dist/**/*'],
	}),
	...configs.typescript({
		tsconfigPath: 'apps/backend/tsconfig.json',
		typeAwareFiles: ['apps/backend/**/*.?([cm])ts'],
	}),
	...configs.drizzle({
		files: ['apps/backend/src/**/*'],
		drizzleObjectName: 'db',
	}),

	// Web
	...configs.javascript({
		files: ['apps/web/**/*'],
		ignores: ['apps/web/.next/**/*'],
	}),
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
	}),
	...configs.next({
		rootDir: 'apps/web',
		files: ['apps/web/**/*'],
		ignores: ['apps/web/.next/**/*'],
	}),

	// eslint-config
	...configs.javascript({
		files: ['packages/eslint-config/**/*'],
	}),

	// pino-pretty-transport
	...configs.javascript({
		files: ['packages/pino-pretty-transport/**/*'],
	}),
	...configs.typescript({
		tsconfigPath: 'packages/pino-pretty-transport/tsconfig.json',
		// pino-pretty does not have complete type declarations
		files: ['packages/pino-pretty-transport/**/*.?([cm])ts'],
	}),

	// ui
	...configs.javascript({
		files: ['packages/ui/**/*'],
	}),
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

	// Turborepo
	...configs.turbo({
		ignores: ['apps/backend/dist/**/*', 'apps/web/.next/**/*'],
	}),
];
