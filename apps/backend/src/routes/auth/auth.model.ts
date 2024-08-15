import Elysia, { Static, t } from 'elysia';
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

export type SignupRequest = Static<typeof signupRequestSchema>;
export type SigninRequest = Static<typeof signinRequestSchema>;
export type SessionResponse = Static<typeof sessionResponseSchema>;
export type ChangePasswordRequest = Static<typeof changePasswordRequestSchema>;

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
});
