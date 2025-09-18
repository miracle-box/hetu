export type ClientAppConfig = {
	buildId: string;
	publicUrl: string;
	textureRoot: string;
};

export function buildClientAppConfig(): ClientAppConfig {
	if (typeof window !== 'undefined') {
		throw new Error(
			'getClientAppConfig should not be called on client side, use useClientAppConfig instead.',
		);
	}

	return {
		buildId: process.env.NEXT_PUBLIC_BUILD_ID,
		publicUrl: process.env.PUBLIC_URL,
		textureRoot: process.env.TEXTURE_STORE_ROOT,
	};
}
