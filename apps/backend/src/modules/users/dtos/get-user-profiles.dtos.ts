import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { userProfileResponseSchema } from './common.dtos';

export const getUserProfilesDtoSchemas = createDtoSchemas({
	params: t.Object({
		id: t.String(),
	}),
	response: {
		200: t.Object({
			profiles: t.Array(userProfileResponseSchema),
		}),
	},
	errors: ['users/forbidden', 'internal-error'],
});
