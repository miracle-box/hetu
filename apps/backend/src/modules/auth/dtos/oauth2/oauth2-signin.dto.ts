import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { sessionSchema } from '../../auth.entities';

export const oauth2SigninDtoSchemas = createDtoSchemas({
	body: t.Object({
		verificationId: t.String(),
	}),
	response: {
		200: t.Object({
			session: sessionSchema,
		}),
	},
	errors: [
		'auth/verification-not-exists',
		'auth/invalid-oauth2-provider',
		'auth/oauth2-misconfigured',
		'auth/oauth2-not-bound',
		'internal-error',
	],
});
