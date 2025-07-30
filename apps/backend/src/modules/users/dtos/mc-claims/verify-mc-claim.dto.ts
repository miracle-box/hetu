import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';
import { mcClaimResponseSchema } from '../common.dto';

export const verifyMcClaimDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			userId: t.String(),
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
	[],
);
