import Elysia, { Static, t } from 'elysia';
import { profileSchema, userSchema } from './common';

export const credentialOpRequestSchema = t.Object({
	username: t.String(),
	password: t.String(),
});

export const tokenOpRequestSchema = t.Object({
	accessToken: t.String(),
	clientToken: t.Optional(t.String()),
});

export const authRequestSchema = t.Composite([
	credentialOpRequestSchema,
	t.Object({
		clientToken: t.Optional(t.String()),
		requestUser: t.Optional(t.Boolean({ default: false })),
		agent: t.Object({
			name: t.String(),
			version: t.Number(),
		}),
	}),
]);

export const authResponseSchema = t.Object({
	accessToken: t.String(),
	clientToken: t.String(),
	availableProfiles: t.Array(profileSchema),
	selectedProfile: t.Optional(profileSchema),
	user: t.Optional(userSchema),
});

export const refreshRequsetSchema = t.Composite([
	tokenOpRequestSchema,
	t.Object({
		requestUser: t.Boolean({ default: false }),
		selectedProfile: t.Optional(profileSchema),
	}),
]);

export const refreshResponseSchema = t.Omit(authResponseSchema, ['availableProfiles']);

export type CredentialOpRequestSchema = Static<typeof credentialOpRequestSchema>;
export type TokenOpRequestSchema = Static<typeof tokenOpRequestSchema>;
export type AuthRequestSchema = Static<typeof authRequestSchema>;
export type AuthResponseSchema = Static<typeof authResponseSchema>;
export type RefreshRequestSchema = Static<typeof refreshRequsetSchema>;
export type RefreshResponseSchema = Static<typeof refreshResponseSchema>;

export const AuthserverModel = new Elysia({ name: 'Model.Yggdrasil.Auth' }).model({
	'yggdrasil.auth.auth.body': authRequestSchema,
	'yggdrasil.auth.auth.response': authResponseSchema,
	'yggdrasil.auth.refresh.body': refreshRequsetSchema,
	'yggdrasil.auth.refresh.response': refreshResponseSchema,
	'yggdrasil.auth.validate.body': tokenOpRequestSchema,
	'yggdrasil.auth.invalidate.body': tokenOpRequestSchema,
	'yggdrasil.auth.signout.body': credentialOpRequestSchema,
});
