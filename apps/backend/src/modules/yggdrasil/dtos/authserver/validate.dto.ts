import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { yggTokenSchema } from '../../yggdrasil.entities';

export const validateDtoSchemas = createDtoSchemas({
	body: yggTokenSchema,
	response: {
		204: t.Void(),
	},
});
