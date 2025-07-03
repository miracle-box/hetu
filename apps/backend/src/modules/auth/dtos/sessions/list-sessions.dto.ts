import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { sessionDigestSchema } from '../common.dtos';

export const listSessionsDtoSchemas = createDtoSchemas({
	response: {
		200: t.Object({
			sessions: t.Array(sessionDigestSchema),
		}),
	},
	errors: ['internal-error'],
});
