import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const resetTextureDtoSchemas = createDtoSchemas({
	headers: t.Object({
		authorization: t.String(),
	}),
	params: t.Object({
		id: t.String(),
		type: t.Union([t.Literal('skin'), t.Literal('cape')]),
	}),
	response: {
		204: t.Void(),
	},
});
