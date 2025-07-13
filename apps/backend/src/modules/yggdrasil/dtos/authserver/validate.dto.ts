import { t } from 'elysia';
import { yggTokenSchema } from '#modules/yggdrasil/yggdrasil.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const validateDtoSchemas = createDtoSchemas({
	body: yggTokenSchema,
	response: {
		204: t.Void(),
	},
});
