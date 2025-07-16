export type ClientAppConfig = {
	buildId: string;
	textureRoot: string;
};

export function getClientAppConfig(): ClientAppConfig {
	if (typeof window !== 'undefined') {
		throw new Error(
			'getClientAppConfig should not be called on client side, use useClientAppConfig instead.',
		);
	}

	return {
		buildId: process.env.NEXT_PUBLIC_BUILD_ID,
		textureRoot: process.env.TEXTURE_STORE_ROOT,
	};
}
