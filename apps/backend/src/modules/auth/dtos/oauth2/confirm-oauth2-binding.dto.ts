import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';

export const confirmOauth2BindingDtoSchemas = createDtoSchemas({
	params: t.Object({
		verificationId: t.String(),
	}),
	response: {
		201: t.Void(),
		204: t.Void(),
	},
	errors: [
		'auth/verification-not-exists',
		'auth/invalid-oauth2-provider',
		'auth/oauth2-misconfigured',
		'auth/oauth2-already-bound',
		'internal-error',
	],
});
