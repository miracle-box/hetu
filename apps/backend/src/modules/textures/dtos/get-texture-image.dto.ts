import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const getTextureImageDtoSchemas = createDtoSchemas(
	{
		params: t.Object({
			id: t.String(),
		}),
	},
	{
		302: t.Void(),
	},
	['textures/not-found', 'internal-error'],
);
