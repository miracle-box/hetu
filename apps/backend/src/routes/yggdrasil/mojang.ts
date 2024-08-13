import Elysia, { Static, t } from 'elysia';
import { profileSchema } from './common';

export const getProfilesRequestSchema = t.Array(t.String());

export const getProfilesResponseSchema = t.Array(t.Omit(profileSchema, ['properties']));

export const textureOpParamsSchema = t.Object({
	id: t.String(),
	type: t.Union([t.Literal('skin'), t.Literal('cape')]),
});

export const uploadTextureBodySchema = t.Object({
	model: t.Optional(t.Union([t.Literal(''), t.Literal('slim')])),
	file: t.File({ type: 'image/png' }),
});

export type GetProfilesRequest = Static<typeof getProfilesRequestSchema>;
export type GetProfilesResponse = Static<typeof getProfilesResponseSchema>;
export type TextureOpParams = Static<typeof textureOpParamsSchema>;
export type UploadTextureBody = Static<typeof uploadTextureBodySchema>;

export const MojangApiModel = new Elysia({ name: 'Model.Yggdrasil.Mojang' }).model({
	'yggdrasil.mojang.get-profiles.body': getProfilesRequestSchema,
	'yggdrasil.mojang.get-profiles.response': getProfilesResponseSchema,
	'yggdrasil.mojang.upload-texture.params': textureOpParamsSchema,
	'yggdrasil.mojang.upload-texture.body': uploadTextureBodySchema,
	'yggdrasil.mojang.reset-texture.params': textureOpParamsSchema,
});
