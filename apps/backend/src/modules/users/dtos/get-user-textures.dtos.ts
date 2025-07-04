import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { userTextureResponseSchema } from './common.dtos';

export const getUserTexturesDtoSchemas = createDtoSchemas({
	params: t.Object({
		id: t.String(),
	}),
	response: {
		200: t.Object({
			textures: t.Array(userTextureResponseSchema),
		}),
	},
	errors: ['users/forbidden', 'internal-error'],
});
