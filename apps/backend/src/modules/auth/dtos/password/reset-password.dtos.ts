import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { sessionSchema } from '../../auth.entities';

export const resetPasswordDtoSchemas = createDtoSchemas({
	body: t.Object({
		verificationId: t.String(),
		newPassword: t.String({
			minLength: 8,
			maxLength: 120,
		}),
	}),
	response: {
		200: t.Object({
			session: sessionSchema,
		}),
	},
	errors: ['auth/invalid-verification', 'users/not-found', 'internal-error'],
});
