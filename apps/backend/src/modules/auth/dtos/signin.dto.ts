import { t } from 'elysia';
import { sessionSchema } from '#modules/auth/auth.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const signinDtoSchemas = createDtoSchemas(
	{
		body: t.Object({
			email: t.String(),
			password: t.String(),
		}),
	},
	{
		200: t.Object({
			session: sessionSchema,
		}),
	},
	['auth/invalid-credentials', 'internal-error'],
);
