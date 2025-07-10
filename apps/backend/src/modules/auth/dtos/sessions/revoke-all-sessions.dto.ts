import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';

export const revokeAllSessionsDtoSchemas = createDtoSchemas({
	response: {
		204: t.Void(),
	},
	errors: ['internal-error'],
});
