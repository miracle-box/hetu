import { Elysia } from 'elysia';
import { errorsMiddleware } from '#shared/middlewares/errors';
import { logger } from '#shared/middlewares/logger';
import { requestId } from '#shared/middlewares/request-id';
import { serverTiming } from '#shared/middlewares/server-timing';
import { gracefulShutdown } from '#shared/middlewares/shutdown';
import { swaggerMiddleware } from '#shared/middlewares/swagger';

export const middlewares = (app: Elysia) =>
	app
		.use(logger)
		.use(requestId)
		.use(errorsMiddleware)
		.use(serverTiming)
		.use(swaggerMiddleware)
		.use(gracefulShutdown);
