import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const getTextureImageDtoSchemas = createDtoSchemas({
	params: t.Object({
		id: t.String(),
	}),
	response: {
		302: t.Void(),
	},
	errors: ['textures/not-found', 'internal-error'],
});
