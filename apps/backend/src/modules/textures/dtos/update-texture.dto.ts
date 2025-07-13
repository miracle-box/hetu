import { t } from 'elysia';
import { textureSchema } from '#modules/textures/textures.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const updateTextureDtoSchemas = createDtoSchemas({
	params: t.Object({
		id: t.String(),
	}),
	body: t.Object({
		name: t.Optional(t.String({ minLength: 3, maxLength: 128 })),
		description: t.Optional(t.String()),
	}),
	response: {
		200: t.Object({
			texture: textureSchema,
		}),
	},
	errors: ['textures/not-found', 'internal-error'],
});
