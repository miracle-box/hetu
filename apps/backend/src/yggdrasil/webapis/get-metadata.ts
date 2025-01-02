import { Static, t } from 'elysia';
import { version } from '../../../package.json';

export const getMetadataResponse = t.Object({
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
});

export function getMetadata(): Static<typeof getMetadataResponse> {
	return {
		meta: {
			serverName: process.env.YGGDRASIL_SERVER_NAME,
			implementationName: 'hetu',
			implementationVersion: version,
			links: {
				homepage: process.env.YGGDRASIL_LINKS_HOMEPAGE,
				register: process.env.YGGDRASIL_LINKS_REGISTER,
			},
			'feature.non_email_login': false,
			'feature.legacy_skin_api': false,
			'feature.no_mojang_namespace': true,
			'feature.enable_mojang_anti_features': true,
			'feature.enable_profile_key': false,
			'feature.username_check': true,
		},
		skinDomains: process.env.YGGDRASIL_SKIN_DOMAINS.split(' ').map((d) => d.trim()),
		signaturePublickey: process.env.YGGDRASIL_PUBLIC_KEY,
	};
}
