import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { verificationScenarioSchema, verificationTypeSchema } from '../../auth.entities';
import { verificationDtoSchema } from '../common.dtos';

export const requestVerificationDtoSchemas = createDtoSchemas({
	body: t.Object({
		type: verificationTypeSchema,
		scenario: verificationScenarioSchema,
		target: t.String(),
	}),
	response: {
		200: t.Object({
			verification: verificationDtoSchema,
		}),
	},
	errors: [
		'auth/user-exists',
		'auth/invalid-verification-scenario',
		'auth/invalid-oauth2-provider',
		'auth/invalid-verification-type',
		'internal-error',
	],
});
