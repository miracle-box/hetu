import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const revokeSessionDtoSchemas = createDtoSchemas({
	params: t.Object({
		id: t.String(),
	}),
	response: {
		204: t.Void(),
	},
	errors: ['auth/invalid-session', 'internal-error'],
});
