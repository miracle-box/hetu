import { Elysia } from 'elysia';
import { logger as niceLogger } from '@tqman/nice-logger';

export const logger = (app: Elysia) =>
	app.use(
		niceLogger({
			enabled: process.env.ENABLE_REQUEST_LOGGER === 'true',
			mode: 'combined',
			withTimestamp: true,
			withBanner: true,
		}),
	);
