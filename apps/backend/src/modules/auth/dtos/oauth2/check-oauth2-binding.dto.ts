import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { userSchema } from '../../../users/users.entities';
import { oauth2ProfileSchema } from '../../auth.entities';

export const checkOauth2BindingDtoSchemas = createDtoSchemas({
	params: t.Object({
		verificationId: t.String(),
	}),
	response: {
		200: t.Object({
			user: userSchema,
			oauth2Profile: oauth2ProfileSchema,
			alreadyBound: t.Boolean(),
		}),
	},
	errors: [
		'auth/verification-not-exists',
		'auth/invalid-oauth2-provider',
		'auth/oauth2-misconfigured',
		'auth/oauth2-already-bound',
		'internal-error',
	],
});
