import { t } from 'elysia';
import {
	yggTokenSchema,
	yggUserSchema,
	yggProfileDigestSchema,
	yggCredentialsSchema,
} from '#modules/yggdrasil/yggdrasil.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export { yggTokenSchema } from '#modules/yggdrasil/yggdrasil.entities';

export const authenticateDtoSchemas = createDtoSchemas({
	body: t.Composite([
		yggCredentialsSchema,
		t.Object({
			clientToken: t.Optional(t.String()),
			requestUser: t.Optional(t.Boolean({ default: false })),
			agent: t.Object({
				name: t.String(),
				version: t.Number(),
			}),
		}),
	]),
	response: {
		200: t.Composite([
			yggTokenSchema,
			t.Object({
				availableProfiles: t.Array(yggProfileDigestSchema),
				selectedProfile: t.Optional(yggProfileDigestSchema),
				user: t.Optional(yggUserSchema),
			}),
		]),
	},
});
