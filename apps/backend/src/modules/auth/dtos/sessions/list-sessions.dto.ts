import { t } from 'elysia';
import { sessionDigestSchema } from '#modules/auth/dtos/common.dto';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const listSessionsDtoSchemas = createDtoSchemas({
	response: {
		200: t.Object({
			sessions: t.Array(sessionDigestSchema),
		}),
	},
	errors: ['internal-error'],
});
