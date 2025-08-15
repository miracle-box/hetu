import { t } from 'elysia';
import { verificationScenarioSchema, verificationTypeSchema } from '#modules/auth/auth.entities';
import { verificationDtoSchema } from '#modules/auth/dtos/common.dto';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const requestVerificationDtoSchemas = createDtoSchemas(
	{
		body: t.Object({
			type: verificationTypeSchema,
			scenario: verificationScenarioSchema,
			target: t.String(),
		}),
	},
	{
		200: t.Object({
			verification: verificationDtoSchema,
		}),
	},
	[
		'auth/user-exists',
		'auth/invalid-verification-scenario',
		'auth/invalid-oauth2-provider',
		'auth/invalid-verification-type',
		'auth/invalid-verification-target',
		'auth/verification-email-error',
		'internal-error',
	],
);
