import { TSchema, t } from 'elysia';

export type AppErrorInfo<TMessageParams> = {
	status: number;
	message: (params: TMessageParams) => string;
	// Only used to refer type here, not the value.
	details: TSchema;
};

export const APP_ERRORS = {
	unauthorized: {
		status: 401,
		message: () =>
			'You must be authorized to access this resource. Please check for token validity.',
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
	'users/forbidden': {
		status: 403,
		message: () =>
			'You do not have permission to access this resource. Please check and try again.',
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
	'profiles/forbidden': {
		status: 403,
		message: () =>
			'You do not have permission to access this profile. Please check and try again.',
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
	'textures/file-exists': {
		status: 409,
		message: () => 'The same texture file already exists. Please check and try again.',
		details: t.Void(),
	},
	'textures/forbidden': {
		status: 403,
		message: () =>
			'You do not have permission to access this texture. Please check and try again.',
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
} as const satisfies Record<string, AppErrorInfo<any>>;
