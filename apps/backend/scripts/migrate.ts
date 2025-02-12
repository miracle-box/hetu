import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { Logger } from '~backend/shared/logger';

// For database migrations only, this file (drizzle.config.ts) is not used in the app.
import { Config, initConfig } from '~backend/shared/config';
initConfig();

Logger.info('Running database migrations.');

const queryClient = postgres(Config.database.migrationUrl, { max: 1 });
migrate(drizzle(queryClient), { migrationsFolder: 'migrations' })
	.then(() => {
		Logger.info('Database migration success.');
	})
	.catch((e) => {
		Logger.error(e, 'Database migration failed.');
	})
	.finally(() => queryClient.end());
