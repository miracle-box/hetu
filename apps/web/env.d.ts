declare namespace NodeJS {
	interface ProcessEnv {
		NEXT_PUBLIC_BUILD_ID: string;
		API_ROOT: string;
		TEXTURE_STORE_ROOT: string;
		JWT_SECRET: string;
	}
}
