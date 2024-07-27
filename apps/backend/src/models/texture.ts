import { createSelectSchema } from 'drizzle-typebox';
import { Static } from 'elysia';
import { textureTable } from '~/db/schema/texture';

export const textureSchema = createSelectSchema(textureTable);

export type Texture = Static<typeof textureSchema>;
