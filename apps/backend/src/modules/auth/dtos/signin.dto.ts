import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { sessionSchema } from '../auth.entities';

export const signinDtoSchemas = createDtoSchemas({
	body: t.Object({
		email: t.String(),
		password: t.String(),
	}),
	response: {
		200: t.Object({
			session: sessionSchema,
		}),
	},
	errors: ['auth/invalid-credentials', 'internal-error'],
});
