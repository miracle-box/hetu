import { t } from 'elysia';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const getOauth2MetadataDtoSchemas = createDtoSchemas({
	response: {
		200: t.Object({
			providers: t.Record(
				t.String(),
				t.Object({
					clientId: t.String(),
					pkce: t.Union([t.Literal(false), t.Literal('S256'), t.Literal('plain')]),
					authEndpoint: t.String(),
					profileScopes: t.Array(t.String()),
				}),
			),
		}),
	},
});
