import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';
import { mcClaimResponseSchema } from '../common.dto';

export const refreshMcProfileDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			userId: t.String(),
			id: t.String(),
		}),
	},
	{
		200: t.Object({
			mcClaim: mcClaimResponseSchema,
		}),
	},
	[],
);
