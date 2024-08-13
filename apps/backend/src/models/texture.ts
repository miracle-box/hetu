import { createSelectSchema } from 'drizzle-typebox';
import { Static } from 'elysia';
import { textureTable } from '~/db/schema/texture';

export const textureSchema = createSelectSchema(textureTable);

export type DbTextureType = 'cape' | 'skin' | 'skin_slim';
export type TextureType = 'cape' | 'skin';
export type Texture = Static<typeof textureSchema>;
