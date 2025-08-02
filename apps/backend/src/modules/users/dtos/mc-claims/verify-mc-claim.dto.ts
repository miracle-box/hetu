import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';
import { mcClaimResponseSchema } from '../common.dto';

export const verifyMcClaimDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			id: t.String(),
		}),
		body: t.Object({
			verificationId: t.String(),
		}),
	},
	{
		200: t.Object({
			mcClaim: mcClaimResponseSchema,
		}),
		201: t.Object({
			mcClaim: mcClaimResponseSchema,
		}),
	},
	[
		'auth/invalid-verification',
		'users/no-valid-mc-entitlement',
		'users/mc-claims-auth-error',
		'users/not-found',
		'users/mc-claim-already-bound',
		'forbidden',
		'internal-error',
	],
);
