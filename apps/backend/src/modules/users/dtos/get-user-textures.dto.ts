import { t } from 'elysia';
import { userTextureResponseSchema } from '#modules/users/dtos/common.dto';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const getUserTexturesDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			id: t.String(),
		}),
	},
	{
		200: t.Object({
			textures: t.Array(userTextureResponseSchema),
		}),
	},
	['forbidden', 'internal-error'],
);
