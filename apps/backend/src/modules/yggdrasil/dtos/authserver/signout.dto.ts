import { t } from 'elysia';
import { yggCredentialsSchema } from '#modules/yggdrasil/yggdrasil.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const signoutDtoSchemas = createDtoSchemas(
	{
		body: yggCredentialsSchema,
	},
	{
		204: t.Void(),
	},
	[],
);
