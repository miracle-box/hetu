import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';

export const prejoinDtoSchemas = createDtoSchemas({
	body: t.Object({}),
	response: {
		200: t.Object({}),
	},
});
