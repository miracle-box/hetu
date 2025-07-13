import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const confirmOauth2BindingDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			verificationId: t.String(),
		}),
	},
	{
		200: t.Void(),
		204: t.Void(),
	},
	[
		'auth/verification-not-exists',
		'auth/invalid-oauth2-provider',
		'auth/oauth2-misconfigured',
		'auth/oauth2-already-bound',
		'internal-error',
	],
);
