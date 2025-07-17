import { t } from 'elysia';
import {
	yggRequestTokenSchema,
	yggProfileDigestSchema,
	yggUserSchema,
	yggResponseTokenSchema,
} from '#modules/yggdrasil/yggdrasil.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const refreshDtoSchemas = createDtoSchemas(
	{
		body: t.Composite([
			yggRequestTokenSchema,
			t.Object({
				requestUser: t.Boolean({ default: false }),
				selectedProfile: t.Optional(yggProfileDigestSchema),
			}),
		]),
	},
	{
		200: t.Composite([
			yggResponseTokenSchema,
			t.Object({
				selectedProfile: t.Optional(yggProfileDigestSchema),
				user: t.Optional(yggUserSchema),
			}),
		]),
	},
	[],
);
