import { t } from 'elysia';
import { sessionSchema } from '#modules/auth/auth.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const refreshSessionDtoSchemas = createDtoSchemas(
	{},
	{
		200: t.Object({
			session: sessionSchema,
		}),
	},
	['auth/invalid-session', 'internal-error'],
);
