import { t } from 'elysia';
import { verificationDtoSchema } from '#modules/auth/dtos/common.dto';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const inspectVerificationDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			id: t.String(),
		}),
	},
	{
		200: t.Object({
			verification: verificationDtoSchema,
		}),
	},
	['auth/verification-not-exists', 'auth/verification-expired', 'internal-error'],
);
