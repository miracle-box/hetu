import { Elysia } from 'elysia';
import { errorsHandler } from './errors';
import { logger } from './logger';
import { requestId } from './request-id';
import { serverTiming } from './server-timing';
import { gracefulShutdown } from './shutdown';
import { swaggerMiddleware } from './swagger';

export const middlewares = (app: Elysia) =>
	app
		.use(swaggerMiddleware)
		.use(logger)
		.use(requestId)
		.use(serverTiming)
		.use(errorsHandler)
		.use(gracefulShutdown);
