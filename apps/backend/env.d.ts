declare module 'bun' {
	interface Env {
		DATABASE_URL: string;
		DATABASE_URL_MIGRATE: string;
		S3_ENDPOINT: string;
		S3_BUCKET: string;
		S3_ACCESS_KEY_ID: string;
		S3_SECRET_ACCESS_KEY: string;
	}
}
