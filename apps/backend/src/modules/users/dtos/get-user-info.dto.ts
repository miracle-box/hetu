import { t } from 'elysia';
import { userResponseSchema } from '#modules/users/dtos/common.dto';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const getUserInfoDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			id: t.String(),
		}),
	},
	{
		200: t.Object({
			user: userResponseSchema,
		}),
	},
	['users/not-found', 'forbidden', 'internal-error'],
);
