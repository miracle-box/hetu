import { t } from 'elysia';
import { sessionSchema } from '#modules/auth/auth.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const changePasswordDtoSchemas = createDtoSchemas({
	body: t.Object({
		oldPassword: t.String(),
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
	errors: ['auth/invalid-credentials', 'users/not-found', 'internal-error'],
});
