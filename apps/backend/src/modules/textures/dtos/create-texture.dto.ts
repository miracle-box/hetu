import { t } from 'elysia';
import { textureSchema } from '#modules/textures/textures.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const createTextureDtoSchemas = createDtoSchemas(
	{
		body: t.Object({
			name: t.String({ minLength: 3, maxLength: 128 }),
			description: t.String(),
			type: t.Union([t.Literal('skin'), t.Literal('skin_slim'), t.Literal('cape')]),
			hash: t.String(),
		}),
	},
	{
		201: t.Object({
			texture: textureSchema,
		}),
	},
	['textures/already-exists', 'internal-error'],
);
