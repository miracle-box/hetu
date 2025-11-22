declare namespace NodeJS {
	interface ProcessEnv {
		NEXT_PUBLIC_BUILD_ID: string;
		PUBLIC_URL: string;
		API_ROOT: string;
		TEXTURE_STORE_ROOT: string;
		JWT_SECRET: string;
		MSA_CLIENT_ID: string;
	}
}
