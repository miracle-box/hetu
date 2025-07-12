import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const joinServerDtoSchemas = createDtoSchemas({
	body: t.Object({
		accessToken: t.String(),
		selectedProfile: t.String(),
		serverId: t.String(),
	}),
	response: {
		204: t.Void(),
	},
});
