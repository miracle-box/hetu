import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { yggTokenSchema, yggProfileDigestSchema, yggUserSchema } from '../../yggdrasil.entities';

export const refreshDtoSchemas = createDtoSchemas({
	body: t.Composite([
		yggTokenSchema,
		t.Object({
			requestUser: t.Boolean({ default: false }),
			selectedProfile: t.Optional(yggProfileDigestSchema),
		}),
	]),
	response: {
		200: t.Composite([
			yggTokenSchema,
			t.Object({
				selectedProfile: t.Optional(yggProfileDigestSchema),
				user: t.Optional(yggUserSchema),
			}),
		]),
	},
});
