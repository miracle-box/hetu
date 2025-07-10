import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { sessionSchema } from '../auth.entities';

export const signupDtoSchemas = createDtoSchemas({
	body: t.Object({
		name: t.String({
			minLength: 3,
			maxLength: 16,
		}),
		verificationId: t.String(),
		email: t.String({ format: 'email' }),
		password: t.String({
			minLength: 8,
			maxLength: 120,
		}),
	}),
	response: {
		200: t.Object({
			session: sessionSchema,
		}),
	},
	errors: ['auth/invalid-verification', 'auth/user-exists', 'internal-error'],
});
