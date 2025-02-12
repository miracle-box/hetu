import { Elysia, t } from 'elysia';
import { version } from '../../../package.json';
import { Config } from '~backend/shared/config';

export const getMetadataHandler = new Elysia().get(
	'/',
	async () => {
		return {
			meta: {
				serverName: Config.app.yggdrasil.serverName,
				implementationName: 'hetu',
				implementationVersion: version,
				links: {
					homepage: Config.app.yggdrasil.links.homepage,
					register: Config.app.yggdrasil.links.register,
				},
				'feature.non_email_login': false,
				'feature.legacy_skin_api': false,
				'feature.no_mojang_namespace': true,
				'feature.enable_mojang_anti_features': true,
				'feature.enable_profile_key': false,
				'feature.username_check': true,
			},
			skinDomains: Config.app.yggdrasil.skinDomains,
			signaturePublickey: Config.app.yggdrasil.profileKeypair.public,
		};
	},
	{
		response: {
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
		detail: {
			summary: 'Get Metadata',
			description: 'API metadata for authlib injector.',
			tags: ['Yggdrasil'],
		},
	},
);
