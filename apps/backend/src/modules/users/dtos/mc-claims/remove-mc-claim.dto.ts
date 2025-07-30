import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const removeMcClaimDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			userId: t.String(),
			id: t.String(),
		}),
	},
	{
		204: t.Void(),
	},
	[],
);
