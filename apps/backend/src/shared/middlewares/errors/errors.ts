import type { TSchema } from 'elysia';
import { t } from 'elysia';

export type AppErrorInfo<TMessageParams> = {
	status: number;
	message: (params: TMessageParams) => string;
	// Only used to refer type here, not the value.
	details: TSchema;
};

export const APP_ERRORS = {
	// Handled in the middleware, only for typing purposes.
	'unknown-error': {
		status: 500,
		message: () => '',
		details: t.Void(),
	},
	'invalid-body': {
		status: 422,
		message: () => '',
		details: t.Void(),
	},
	// Begin of app errors.
	unauthorized: {
		status: 401,
		message: () =>
			'You must be authorized to access this resource. Please check for token validity.',
		details: t.Void(),
	},
	forbidden: {
		status: 403,
		message: () =>
			'You do not have permission to access this resource. Please check and try again.',
		details: t.Void(),
	},
	// For known app errors (e.g. DatabaseError), unlike unknown errors caught by middleware.
	'internal-error': {
		status: 500,
		message: () => 'An internal error occurred. Please try again later.',
		// [TODO] Add an cause to the error and we can log it
		details: t.Void(),
	},
	'auth/invalid-credentials': {
		status: 400,
		message: () => 'The provided credentials are incorrect. Please check and try again.',
		details: t.Void(),
	},
	'auth/invalid-session': {
		status: 400,
		message: () => 'The requested session is invalid. Please check and try again.',
		details: t.Void(),
	},
	'auth/user-exists': {
		status: 409,
		message: () =>
			'A user with the same name or email already exists. Please use a different name or email.',
		details: t.Void(),
	},
	'auth/invalid-verification': {
		status: 400,
		message: () =>
			'The provided verification is invalid. Please check the verification status and try again.',
		details: t.Void(),
	},
	'auth/invalid-verification-scenario': {
		status: 400,
		message: () =>
			'The verification scenario is invalid. Please use a valid verification scenario.',
		details: t.Void(),
	},
	'auth/invalid-verification-type': {
		status: 400,
		message: () => 'The verification type is invalid. Please use a known verification type.',
		details: t.Void(),
	},
	'auth/verification-email-error': {
		status: 503,
		message: () =>
			'An error occurred while sending the verification email. Please try again later.',
		details: t.Void(),
	},
	'auth/verification-not-exists': {
		status: 404,
		message: () => 'The requested verification does not exist. Please check and try again.',
		details: t.Void(),
	},
	'auth/verification-already-verified': {
		status: 409,
		message: () =>
			'The verification code has already been verified. Use this one for your operation.',
		details: t.Void(),
	},
	'auth/verification-expired': {
		status: 410,
		message: () => 'The verification code has expired. Please request a new one.',
		details: t.Void(),
	},
	'auth/verification-invalid-code': {
		status: 403,
		message: () => 'The verification code is invalid. Please check and try again.',
		details: t.Void(),
	},
	'auth/invalid-oauth2-provider': {
		status: 400,
		message: () => 'The OAuth2 provider is not supported. Please check and try again.',
		details: t.Void(),
	},
	'auth/invalid-oauth2-grant': {
		status: 400,
		message: () =>
			'Failed to obtain access token or the token is invalid. Please check and try again.',
		details: t.Void(),
	},
	'auth/oauth2-misconfigured': {
		status: 500,
		message: () => 'Authentication service is temporarily unavailable. Please try again later.',
		details: t.Void(),
	},
	'auth/oauth2-already-bound': {
		status: 409,
		message: () =>
			'The OAuth2 account is already bound to another user. Sign in with that account or unlink it before trying again.',
		details: t.Void(),
	},
	'auth/oauth2-not-bound': {
		status: 403,
		message: () =>
			'The OAuth2 account is not linked with any local user. Please bind it before trying again.',
		details: t.Void(),
	},
	'users/not-found': {
		status: 404,
		message: () => 'The requested user could not be found. Please check and try again.',
		details: t.Void(),
	},
	'profiles/name-exists': {
		status: 409,
		message: () => 'The player name has already been taken. Please choose a different name.',
		details: t.Void(),
	},
	'profiles/not-found': {
		status: 404,
		message: () => 'The requested profile could not be found. Please check and try again.',
		details: t.Void(),
	},
	'profiles/not-exists': {
		status: 404,
		message: () => 'The requested profile does not exist. Please check and try again.',
		details: t.Void(),
	},
	'profiles/primary-exists': {
		status: 409,
		message: () => 'The user already has a primary profile. Please use that one instead.',
		details: t.Void(),
	},
	'profiles/skin-invalid': {
		status: 400,
		message: () =>
			'The skin texture is invalid. Please ensure the texture is valid and try again.',
		details: t.Void(),
	},
	'profiles/cape-invalid': {
		status: 400,
		message: () =>
			'The cape texture is invalid. Please ensure the texture is valid and try again.',
		details: t.Void(),
	},
	'textures/already-exists': {
		status: 409,
		message: () => 'The same texture already exists. Please use that one instead.',
		details: t.Void(),
	},
	'textures/not-found': {
		status: 404,
		message: () =>
			'The requested texture could not be found. Please check the texture and try again.',
		details: t.Void(),
	},
	'textures/not-exists': {
		status: 404,
		message: () => 'The requested skin texture does not exist. Please check and try again.',
		details: t.Void(),
	},
	'files/invalid-file-type': {
		status: 415,
		message: () => 'The file type is not supported. Please ensure the file type is correct.',
		details: t.Void(),
	},
	'files/malformed-file': {
		status: 400,
		message: () => 'The file is malformed. Please ensure the file is correct.',
		details: t.Object({
			message: t.String(),
		}),
	},
} as const satisfies Record<string, AppErrorInfo<unknown>>;
