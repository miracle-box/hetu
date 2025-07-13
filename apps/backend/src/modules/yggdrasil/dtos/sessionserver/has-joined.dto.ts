import { t } from 'elysia';
import { yggProfileSchema } from '#modules/yggdrasil/yggdrasil.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const hasJoinedDtoSchemas = createDtoSchemas(
	{
		query: t.Object({
			username: t.String(),
			serverId: t.String(),
			ip: t.Optional(t.String()),
		}),
	},
	{
		200: yggProfileSchema,
		204: t.Void(),
	},
	[],
);
