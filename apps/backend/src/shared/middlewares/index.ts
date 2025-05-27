import { Elysia } from 'elysia';
import { errorsMiddleware } from './errors';
import { logger } from './logger';
import { requestId } from './request-id';
import { serverTiming } from './server-timing';
import { gracefulShutdown } from './shutdown';
import { swaggerMiddleware } from './swagger';

export const middlewares = (app: Elysia) =>
	app
		.use(logger)
		.use(requestId)
		.use(errorsMiddleware)
		.use(serverTiming)
		.use(swaggerMiddleware)
		.use(gracefulShutdown);
