import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { userResponseSchema } from './common.dto';

export const getUserInfoDtoSchemas = createDtoSchemas({
	params: t.Object({
		id: t.String(),
	}),
	response: {
		200: t.Object({
			user: userResponseSchema,
		}),
	},
	errors: ['users/not-found', 'forbidden', 'internal-error'],
});
