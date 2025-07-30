import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';
import { mcClaimResponseSchema } from '../common.dto';

export const modifyMcClaimDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			userId: t.String(),
			id: t.String(),
		}),
		body: t.Object({
			boundProfileId: t.Optional(t.Union([t.String(), t.Null()])),
		}),
	},
	{
		200: t.Object({
			mcClaim: mcClaimResponseSchema,
		}),
	},
	[],
);
