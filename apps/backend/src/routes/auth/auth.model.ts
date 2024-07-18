import Elysia, { Static, t } from 'elysia';

export const authSignupRequestSchema = t.Object({
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
export type AuthSignupRequest = Static<typeof authSignupRequestSchema>;

export const authSigninRequestSchema = t.Object({
	email: t.String(),
	password: t.String(),
});
export type AuthSigninRequest = Static<typeof authSigninRequestSchema>;

export const authSigninResponseSchema = t.Object({
	sessionId: t.String(),
	expiresAt: t.Date(),
});
export type AuthSigninResponse = Static<typeof authSigninResponseSchema>;

export const AuthModel = new Elysia({ name: 'Model.Auth' }).model({
	'auth.signup.body': authSignupRequestSchema,
	'auth.signin.body': authSigninRequestSchema,
	'auth.signin.response': authSigninResponseSchema,
});
