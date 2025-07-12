import { t } from 'elysia';
import { verificationDtoSchema } from '#modules/auth/dtos/common.dto';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const verifyVerificationDtoSchemas = createDtoSchemas({
	body: t.Object({
		id: t.String(),
		code: t.String(),
		// Only exists in OAuth2 verifications
		redirectUri: t.Optional(t.String({ format: 'uri' })),
	}),
	response: {
		200: t.Object({
			verification: verificationDtoSchema,
		}),
	},
	errors: [
		'auth/verification-not-exists',
		'auth/verification-expired',
		'auth/verification-invalid-code',
		'auth/verification-already-verified',
		'auth/invalid-verification-type',
		'auth/invalid-oauth2-grant',
		'auth/invalid-oauth2-provider',
		'auth/oauth2-misconfigured',
		'internal-error',
	],
});
