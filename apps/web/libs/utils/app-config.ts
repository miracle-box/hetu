export type ClientAppConfig = {
	textureRoot: string;
};

export const defaultClientAppConfig: ClientAppConfig = {
	textureRoot: '',
};

export function getClientAppConfig(): ClientAppConfig {
	return {
		textureRoot: process.env.TEXTURE_STORE_ROOT,
	};
}
