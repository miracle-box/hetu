import { t } from 'elysia';
import {
	yggTokenSchema,
	yggProfileDigestSchema,
	yggUserSchema,
} from '#modules/yggdrasil/yggdrasil.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const refreshDtoSchemas = createDtoSchemas(
	{
		body: t.Composite([
			yggTokenSchema,
			t.Object({
				requestUser: t.Boolean({ default: false }),
				selectedProfile: t.Optional(yggProfileDigestSchema),
			}),
		]),
	},
	{
		200: t.Composite([
			yggTokenSchema,
			t.Object({
				selectedProfile: t.Optional(yggProfileDigestSchema),
				user: t.Optional(yggUserSchema),
			}),
		]),
	},
	[],
);
