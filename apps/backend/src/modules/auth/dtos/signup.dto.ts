import { t } from 'elysia';
import { sessionSchema } from '#modules/auth/auth.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const signupDtoSchemas = createDtoSchemas(
	{
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
	},
	{
		200: t.Object({
			session: sessionSchema,
		}),
	},
	['auth/invalid-verification', 'auth/user-exists', 'internal-error'],
);
