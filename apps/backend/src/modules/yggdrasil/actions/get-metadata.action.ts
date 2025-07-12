import { Right } from 'purify-ts';
import { Config } from '#config';
import { version } from '#package.json';

export const getMetadataAction = async () => {
	return Right({
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
	});
};
