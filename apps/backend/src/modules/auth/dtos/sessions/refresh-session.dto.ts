import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { sessionSchema } from '../../auth.entities';

export const refreshSessionDtoSchemas = createDtoSchemas({
	response: {
		200: t.Object({
			session: sessionSchema,
		}),
	},
	errors: ['auth/invalid-session', 'internal-error'],
});
