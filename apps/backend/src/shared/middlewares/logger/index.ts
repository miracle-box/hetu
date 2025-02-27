import { logger as niceLogger } from '@tqman/nice-logger';
import { Elysia } from 'elysia';
import { Config } from '~backend/shared/config';

export const logger = (app: Elysia) =>
	app.use(
		niceLogger({
			enabled: Config.debug.logRequests,
			mode: 'combined',
			withTimestamp: true,
		}),
	);
