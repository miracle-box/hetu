import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const revokeSessionDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			id: t.String(),
		}),
	},
	{
		204: t.Void(),
	},
	['auth/invalid-session', 'internal-error'],
);
