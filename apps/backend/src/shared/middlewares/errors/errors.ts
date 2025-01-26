import { TSchema, t } from 'elysia';

export type AppErrorInfo<TMessageParams> = {
	status: number;
	message: (params: TMessageParams) => string;
	// Only used to refer type here, not the value.
	details: TSchema;
};

export const APP_ERRORS = {
	'auth/unauthorized': {
		status: 401,
		message: () => 'You must be signed in to access this resource.',
		details: t.Object({
			prop: t.String(),
		}),
	},
} as const satisfies Record<string, AppErrorInfo<any>>;
