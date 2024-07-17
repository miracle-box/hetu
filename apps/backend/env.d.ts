declare module 'bun' {
	interface Env {
		DATABASE_URL: string;
		DATABASE_URL_MIGRATE: string;
	}
}
