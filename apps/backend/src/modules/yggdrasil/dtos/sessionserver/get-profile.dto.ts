import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { yggProfileSchema } from '../../yggdrasil.entities';

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
