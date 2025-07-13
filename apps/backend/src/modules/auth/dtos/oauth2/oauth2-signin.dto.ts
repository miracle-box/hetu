import { t } from 'elysia';
import { sessionSchema } from '#modules/auth/auth.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const oauth2SigninDtoSchemas = createDtoSchemas(
	{
		body: t.Object({
			verificationId: t.String(),
		}),
	},
	{
		200: t.Object({
			session: sessionSchema,
		}),
	},
	[
		'auth/verification-not-exists',
		'auth/invalid-oauth2-provider',
		'auth/oauth2-misconfigured',
		'auth/oauth2-not-bound',
		'internal-error',
	],
);
