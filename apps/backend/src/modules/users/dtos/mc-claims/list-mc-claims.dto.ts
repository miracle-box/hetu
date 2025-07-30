import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';
import { mcClaimResponseSchema } from '../common.dto';

export const listMcClaimsDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			userId: t.String(),
		}),
	},
	{
		200: t.Object({
			mcClaims: t.Array(mcClaimResponseSchema),
		}),
	},
	[],
);
