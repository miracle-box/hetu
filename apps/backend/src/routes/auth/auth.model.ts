import Elysia, { Static, t } from 'elysia';
import { verificationSummarySchema } from '~/models/auth';
import { sessionSchema, sessionSummarySchema } from '~/models/session';

export const signupRequestSchema = t.Object({
	name: t.String({
		minLength: 3,
		maxLength: 16,
	}),
	email: t.String({ format: 'email' }),
	password: t.String({
		minLength: 8,
		maxLength: 120,
	}),
});

export const signinRequestSchema = t.Object({
	email: t.String(),
	password: t.String(),
});

export const sessionResponseSchema = t.Object({
	session: sessionSchema,
});

export const changePasswordRequestSchema = t.Object({
	oldPassword: t.String(),
	newPassword: t.String({
		minLength: 8,
		maxLength: 120,
	}),
});

export const resetPasswordInitRequestSchema = t.Object({
	email: t.String({ format: 'email' }),
});

export const resetPasswordRequestSchema = t.Object({
	verificationSecret: t.String(),
	password: t.String(),
});

export type SignupRequest = Static<typeof signupRequestSchema>;
export type SigninRequest = Static<typeof signinRequestSchema>;
export type SessionResponse = Static<typeof sessionResponseSchema>;
export type ChangePasswordRequest = Static<typeof changePasswordRequestSchema>;
export type ResetPasswordInitRequest = Static<typeof resetPasswordInitRequestSchema>;
export type ResetPasswordRequest = Static<typeof resetPasswordRequestSchema>;

export const AuthModel = new Elysia({ name: 'Model.Auth' }).model({
	'auth.signup.body': signupRequestSchema,
	'auth.signup.response': sessionResponseSchema,
	'auth.signin.body': signinRequestSchema,
	'auth.signin.response': sessionResponseSchema,
	'auth.sessions.refresh.response': sessionResponseSchema,
	'auth.sessions.summary.response': sessionSummarySchema,
	'auth.sessions.summary-all.response': t.Array(sessionSummarySchema),
	'auth.change-password.body': changePasswordRequestSchema,
	'auth.change-password.response': sessionResponseSchema,
	'auth.reset-password-init.body': resetPasswordInitRequestSchema,
	'auth.reset-password-init.response': verificationSummarySchema,
	'auth.reset-password.body': resetPasswordRequestSchema,
});
