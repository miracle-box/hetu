import Elysia, { Static, t } from 'elysia';

export const prejoinRequestSchema = t.Object({
	id: t.String(),
	username: t.String(),
	serverId: t.String(),
});

export type PrejoinRequest = Static<typeof prejoinRequestSchema>;

export const CustomApiModel = new Elysia({ name: 'Model.Yggdrasil.Custom' }).model({
	'yggdrasil.custom.prejoin.body': prejoinRequestSchema,
});
