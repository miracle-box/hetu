import type { EnumLikeValues } from '#shared/typing/utils';
import type { Static } from 'elysia';
import { t } from 'elysia';

export const TextureType = {
	CAPE: 'cape',
	SKIN: 'skin',
	SKIN_SLIM: 'skin_slim',
} as const;

export const textureSchema = t.Object({
	id: t.String(),
	authorId: t.String(),
	name: t.String(),
	description: t.String(),
	type: t.Enum(TextureType),
	hash: t.String(),
});

export type TextureType = EnumLikeValues<typeof TextureType>;
export type Texture = Static<typeof textureSchema>;
