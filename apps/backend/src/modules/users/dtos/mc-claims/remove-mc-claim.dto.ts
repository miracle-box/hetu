import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const removeMcClaimDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			id: t.String(),
			mcClaimId: t.String(),
		}),
	},
	{
		204: t.Void(),
	},
	['users/not-found', 'users/mc-claim-not-found', 'forbidden', 'internal-error'],
);
