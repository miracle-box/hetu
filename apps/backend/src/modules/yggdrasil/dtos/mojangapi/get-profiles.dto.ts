import { t } from 'elysia';
import { yggProfileDigestSchema } from '#modules/yggdrasil/yggdrasil.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const getProfilesDtoSchemas = createDtoSchemas(
	{
		body: t.Array(t.String()),
	},
	{
		200: t.Array(yggProfileDigestSchema),
	},
	[],
);
