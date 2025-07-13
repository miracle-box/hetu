import { t } from 'elysia';
import { sessionSchema } from '#modules/auth/auth.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const resetPasswordDtoSchemas = createDtoSchemas(
	{
		body: t.Object({
			verificationId: t.String(),
			newPassword: t.String({
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
	['auth/invalid-verification', 'users/not-found', 'internal-error'],
);
