import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { sessionSchema } from '../../auth.entities';

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
