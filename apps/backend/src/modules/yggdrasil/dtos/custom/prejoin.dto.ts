import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const prejoinDtoSchemas = createDtoSchemas(
	{
		body: t.Object({}),
	},
	{
		200: t.Object({}),
	},
	[],
);
