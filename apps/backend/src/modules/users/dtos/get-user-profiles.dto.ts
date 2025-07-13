import { t } from 'elysia';
import { userProfileResponseSchema } from '#modules/users/dtos/common.dto';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const getUserProfilesDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			id: t.String(),
		}),
	},
	{
		200: t.Object({
			profiles: t.Array(userProfileResponseSchema),
		}),
	},
	['forbidden', 'internal-error'],
);
