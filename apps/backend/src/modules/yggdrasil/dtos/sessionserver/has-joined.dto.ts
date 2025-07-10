import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { yggProfileSchema } from '../../yggdrasil.entities';

export const hasJoinedDtoSchemas = createDtoSchemas({
	query: t.Object({
		username: t.String(),
		serverId: t.String(),
		ip: t.Optional(t.String()),
	}),
	response: {
		200: yggProfileSchema,
		204: t.Void(),
	},
});
