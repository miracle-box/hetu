import { t } from 'elysia';
import { yggProfileSchema } from '#modules/yggdrasil/yggdrasil.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const getProfileDtoSchemas = createDtoSchemas({
	params: t.Object({
		id: t.String(),
	}),
	query: t.Object({
		unsigned: t.Optional(t.Boolean()),
	}),
	response: {
		200: yggProfileSchema,
		204: t.Void(),
	},
});
