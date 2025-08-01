import { t } from 'elysia';
import { yggRequestTokenSchema } from '#modules/yggdrasil/yggdrasil.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const validateDtoSchemas = createDtoSchemas(
	{
		body: yggRequestTokenSchema,
	},
	{
		204: t.Void(),
	},
	[],
);
