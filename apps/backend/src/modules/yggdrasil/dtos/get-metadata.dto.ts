import { createDtoSchemas } from '#shared/middlewares/dto/schemas';
import { t } from 'elysia';

export const getMetadataDtoSchemas = createDtoSchemas(
	{},
	{
		200: t.Object({
			meta: t.Object({
				serverName: t.String(),
				implementationName: t.String(),
				implementationVersion: t.String(),
				links: t.Object({
					homepage: t.String({ format: 'uri' }),
					register: t.String({ format: 'uri' }),
				}),
				'feature.non_email_login': t.Boolean(),
				'feature.legacy_skin_api': t.Boolean(),
				'feature.no_mojang_namespace': t.Boolean(),
				'feature.enable_mojang_anti_features': t.Boolean(),
				'feature.enable_profile_key': t.Boolean(),
				'feature.username_check': t.Boolean(),
			}),
			skinDomains: t.Array(t.String()),
			signaturePublickey: t.String(),
		}),
	},
	[],
);
