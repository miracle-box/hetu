import { Config, defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/shared/db/schema/*',
	dialect: 'postgresql',
	out: './migrations',
} satisfies Config);
