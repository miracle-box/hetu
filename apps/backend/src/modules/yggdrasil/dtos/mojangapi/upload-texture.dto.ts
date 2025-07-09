import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';

export const uploadTextureDtoSchemas = createDtoSchemas({
	headers: t.Object({
		authorization: t.String(),
	}),
	params: t.Object({
		id: t.String(),
		type: t.Union([t.Literal('skin'), t.Literal('cape')]),
	}),
	body: t.Object({
		model: t.Optional(t.Union([t.Literal(''), t.Literal('slim')])),
		file: t.File({ type: 'image/png' }),
	}),
	response: {
		204: t.Void(),
	},
});
