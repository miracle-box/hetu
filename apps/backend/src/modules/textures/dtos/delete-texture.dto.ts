import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';

export const deleteTextureDtoSchemas = createDtoSchemas({
	params: t.Object({
		id: t.String(),
	}),
	response: {
		204: t.Void(),
	},
	errors: ['textures/not-found', 'internal-error'],
});
