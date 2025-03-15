import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { Logger } from '~backend/shared/logger';

export const runMigration = async (url: string) => {
	Logger.info('Running database migrations.');

	const queryClient = postgres(url, { max: 1 });
	migrate(drizzle(queryClient), { migrationsFolder: 'migrations' })
		.then(() => {
			Logger.info('Database migration success.');
		})
		.catch((e) => {
			Logger.error(e, 'Database migration failed.');
		});

	await queryClient.end();
};
