import { t } from 'elysia';
import { oauth2ProfileSchema } from '#modules/auth/auth.entities';
import { userSchema } from '#modules/users/users.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const checkOauth2BindingDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			verificationId: t.String(),
		}),
	},
	{
		200: t.Object({
			user: userSchema,
			provider: t.String(),
			oauth2Profile: oauth2ProfileSchema,
			alreadyBound: t.Boolean(),
		}),
	},
	[
		'auth/verification-not-exists',
		'auth/invalid-oauth2-provider',
		'auth/oauth2-misconfigured',
		'auth/oauth2-already-bound',
		'internal-error',
	],
);
