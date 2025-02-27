import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { Config, initConfig } from '~backend/shared/config';
import { Logger } from '~backend/shared/logger';

// For database migrations only, this file (drizzle.config.ts) is not used in the app.
initConfig();

Logger.info('Running database migrations.');

const queryClient = postgres(Config.database.migrationUrl, { max: 1 });
migrate(drizzle(queryClient), { migrationsFolder: 'migrations' })
	.then(() => {
		Logger.info('Database migration success.');
	})
	.catch((e) => {
		Logger.error(e, 'Database migration failed.');
	});

await queryClient.end();
