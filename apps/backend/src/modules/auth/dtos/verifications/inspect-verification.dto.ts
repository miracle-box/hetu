import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { verificationDtoSchema } from '../common.dto';

export const inspectVerificationDtoSchemas = createDtoSchemas({
	params: t.Object({
		id: t.String(),
	}),
	response: {
		200: t.Object({
			verification: verificationDtoSchema,
		}),
	},
	errors: ['auth/verification-not-exists', 'auth/verification-expired', 'internal-error'],
});
