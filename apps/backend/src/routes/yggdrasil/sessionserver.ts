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
	ip: t.String(),
});

export const profileRequestSchema = t.Object({
	id: t.String(),
	unsigned: t.Boolean(),
});

export type JoinRequest = Static<typeof joinRequestSchema>;
export type HasJoinedRequest = Static<typeof hasJoinedRequestSchema>;
export type ProfileRequest = Static<typeof profileRequestSchema>;

export const SessionserverModel = new Elysia({ name: 'Model.Yggdrasil.Session' }).model({
	'yggdrasil.session.join.body': joinRequestSchema,
	'yggdrasil.session.hasjoined.query': hasJoinedRequestSchema,
	'yggdrasil.session.hasjoined.response': profileSchema,
	'yggdrasil.session.profile.query': profileRequestSchema,
	'yggdrasil.session.profile.response': profileSchema,
});
