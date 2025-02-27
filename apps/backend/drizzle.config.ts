import type { Config } from 'drizzle-kit';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/shared/db/schema/*',
	dialect: 'postgresql',
	out: './migrations',
} satisfies Config);
