import { t } from 'elysia';
import { yggProfileDigestSchema } from '#modules/yggdrasil/yggdrasil.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const getPlayerUuidDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			name: t.String(),
		}),
	},
	{
		200: yggProfileDigestSchema,
	},
	[],
);
