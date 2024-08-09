import Elysia, { Static, t } from 'elysia';
import { profileSchema, userSchema } from './common';

export const authRequestSchema = t.Object({
	username: t.String(),
	password: t.String(),
	clientToken: t.Optional(t.String()),
	requestUser: t.Optional(t.Boolean({ default: false })),
	agent: t.Object({
		name: t.String(),
		version: t.Number(),
	}),
});

export const authResponseSchema = t.Object({
	accessToken: t.String(),
	clientToken: t.String(),
	availableProfiles: t.Array(profileSchema),
	selectedProfile: t.Optional(profileSchema),
	user: t.Optional(userSchema),
});

export type AuthRequestSchema = Static<typeof authRequestSchema>;
export type AuthResponseSchema = Static<typeof authResponseSchema>;

export const AuthserverModel = new Elysia({ name: 'Model.Yggdrasil.Authserver' }).model({
	'yggdrasil.authserver.auth.body': authRequestSchema,
	'yggdrasil.authserver.auth.response': authResponseSchema,
});
