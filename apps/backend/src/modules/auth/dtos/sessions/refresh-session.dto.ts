import { t } from 'elysia';
import { sessionSchema } from '#modules/auth/auth.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const refreshSessionDtoSchemas = createDtoSchemas({
	response: {
		200: t.Object({
			session: sessionSchema,
		}),
	},
	errors: ['auth/invalid-session', 'internal-error'],
});
