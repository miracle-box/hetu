import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';
import { mcClaimResponseSchema } from '../common.dto';

export const listMcClaimsDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			id: t.String(),
		}),
	},
	{
		200: t.Object({
			mcClaims: t.Array(mcClaimResponseSchema),
		}),
	},
	['users/not-found', 'forbidden', 'internal-error'],
);
