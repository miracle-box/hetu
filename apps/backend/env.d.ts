declare module NodeJS {
	interface ProcessEnv {
		BASE_URL: string;
		DATABASE_URL: string;
		DATABASE_URL_MIGRATE: string;
		S3_ENDPOINT: string;
		S3_PUBLIC_ROOT: string;
		S3_BUCKET: string;
		S3_PREFIX: string;
		S3_ACCESS_KEY_ID: string;
		S3_SECRET_ACCESS_KEY: string;
		YGGDRASIL_SERVER_NAME: string;
		YGGDRASIL_LINKS_HOMEPAGE: string;
		YGGDRASIL_LINKS_REGISTER: string;
		YGGDRASIL_SKIN_DOMAINS: string;
		YGGDRASIL_PRIVATE_KEY: string;
		YGGDRASIL_PUBLIC_KEY: string;
		MAIL_SMTP_HOST: string;
		MAIL_SMTP_PORT: string;
		MAIL_SMTP_SECURE: string;
		MAIL_SMTP_USER: string;
		MAIL_SMTP_PASS: string;
		MAIL_SMTP_FROM: string;
	}
}
