import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const deleteProfileDtoSchemas = createDtoSchemas({
	params: t.Object({
		id: t.String(),
	}),
	response: {
		204: t.Void(),
	},
	errors: ['profiles/not-found', 'internal-error'],
});
