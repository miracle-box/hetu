import { t } from 'elysia';
import {
	yggCredentialsSchema,
	yggProfileDigestSchema,
	yggUserSchema,
	yggResponseTokenSchema,
} from '#modules/yggdrasil/yggdrasil.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const authenticateDtoSchemas = createDtoSchemas(
	{
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
	},
	{
		200: t.Composite([
			yggResponseTokenSchema,
			t.Object({
				availableProfiles: t.Array(yggProfileDigestSchema),
				selectedProfile: t.Optional(yggProfileDigestSchema),
				user: t.Optional(yggUserSchema),
			}),
		]),
	},
	[],
);
