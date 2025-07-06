import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { textureSchema } from '../textures.entities';

export const createTextureDtoSchemas = createDtoSchemas({
	body: t.Object({
		name: t.String({ minLength: 3, maxLength: 128 }),
		description: t.String(),
		type: t.Union([t.Literal('skin'), t.Literal('skin_slim'), t.Literal('cape')]),
		hash: t.String(),
	}),
	response: {
		200: t.Object({
			texture: textureSchema,
		}),
	},
	errors: ['textures/already-exists', 'internal-error'],
});
