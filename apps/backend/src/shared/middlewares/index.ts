import { Elysia } from 'elysia';
import { errorsHandler } from '~backend/shared/middlewares/errors';
import { logger } from '~backend/shared/middlewares/logger';
import { serverTiming } from '~backend/shared/middlewares/server-timing';
import { swaggerMiddleware } from '~backend/shared/middlewares/swagger';

export const middlewares = (app: Elysia) =>
	app.use(swaggerMiddleware).use(logger).use(serverTiming).use(errorsHandler);
