import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const revokeAllSessionsDtoSchemas = createDtoSchemas(
	{},
	{
		204: t.Void(),
	},
	['internal-error'],
);
