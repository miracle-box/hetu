import Elysia, { Static, t } from 'elysia';
import { profileSchema } from './common';

export const joinRequestSchema = t.Object({
	accessToken: t.String(),
	selectedProfile: t.String(),
	serverId: t.String(),
});

export const hasJoinedRequestSchema = t.Object({
	username: t.String(),
	serverId: t.String(),
	ip: t.Optional(t.String()),
});

export const profileParamsSchema = t.Object({
	id: t.String(),
});

export const profileQuerySchema = t.Object({
	unsigned: t.Optional(t.Boolean()),
});

export type JoinRequest = Static<typeof joinRequestSchema>;
export type HasJoinedRequest = Static<typeof hasJoinedRequestSchema>;
export type ProfileParams = Static<typeof profileParamsSchema>;
export type ProfileQuery = Static<typeof profileQuerySchema>;

export const SessionserverModel = new Elysia({ name: 'Model.Yggdrasil.Session' }).model({
	'yggdrasil.session.join.body': joinRequestSchema,
	'yggdrasil.session.hasjoined.query': hasJoinedRequestSchema,
	'yggdrasil.session.hasjoined.response': profileSchema,
	'yggdrasil.session.profile.params': profileParamsSchema,
	'yggdrasil.session.profile.query': profileQuerySchema,
	'yggdrasil.session.profile.response': profileSchema,
});
