import 'server-only';

export type ClientAppConfig = {
	buildId: string;
	publicUrl: string;
	textureRoot: string;
};

export function getClientAppConfig(): ClientAppConfig {
	return {
		buildId: process.env.NEXT_PUBLIC_BUILD_ID,
		publicUrl: process.env.PUBLIC_URL,
		textureRoot: process.env.TEXTURE_STORE_ROOT,
	};
}
