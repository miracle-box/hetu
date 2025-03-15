import { Elysia } from 'elysia';
import { Logger } from '~backend/shared/logger';
export const gracefulShutdown = (app: Elysia) =>
	app.on('stop', () => {
		Logger.info('Gracefully shutting down the server.');
	});
