import { Static, t } from 'elysia';

export enum TextureType {
	CAPE = 'cape',
	SKIN = 'skin',
	SKIN_SLIM = 'skin_slim',
}

export const textureSchema = t.Object({
	id: t.String(),
	authorId: t.String(),
	name: t.String(),
	description: t.String(),
	type: t.Enum(TextureType),
	hash: t.String(),
});

export type Texture = Static<typeof textureSchema>;
