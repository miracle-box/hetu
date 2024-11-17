import { Config, defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/shared/db/schema/*',
	dialect: 'postgresql',
	out: './migrations',
	dbCredentials: {
		url: process.env.DATABASE_URL_MIGRATE,
	},
} satisfies Config);
