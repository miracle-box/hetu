import { createSelectSchema } from 'drizzle-typebox';
import { Static, t } from 'elysia';
import { textureTable } from '~/db/schema/texture';

export const textureSchema = createSelectSchema(textureTable);
export const DbTextureTypeSchema = t.Union([
	t.Literal('cape'),
	t.Literal('skin'),
	t.Literal('skin_slim'),
]);

export const textureTypeSchema = t.Union([t.Literal('cape'), t.Literal('skin')]);

export type DbTextureType = Static<typeof DbTextureTypeSchema>;
export type TextureType = Static<typeof textureTypeSchema>;
export type Texture = Static<typeof textureSchema>;
