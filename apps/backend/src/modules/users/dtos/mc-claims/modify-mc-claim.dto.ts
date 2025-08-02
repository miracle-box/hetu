import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';
import { mcClaimResponseSchema } from '../common.dto';

export const modifyMcClaimDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			id: t.String(),
			mcClaimId: t.String(),
		}),
		body: t.Object({
			boundProfileId: t.Optional(t.Union([t.String({ format: 'uuid' }), t.Null()])),
		}),
	},
	{
		200: t.Object({
			mcClaim: mcClaimResponseSchema,
		}),
	},
	[
		'users/not-found',
		'profiles/not-found',
		'users/mc-claim-not-found',
		'forbidden',
		'internal-error',
	],
);
