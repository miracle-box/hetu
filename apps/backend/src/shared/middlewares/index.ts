import { Elysia } from 'elysia';
import { swaggerMiddleware } from '~backend/shared/middlewares/swagger';
import { logger } from '~backend/shared/middlewares/logger';
import { errorsHandler } from '~backend/shared/middlewares/errors';
import { serverTiming } from '~backend/shared/middlewares/server-timing';

export const middlewares = (app: Elysia) =>
	app.use(swaggerMiddleware).use(logger).use(serverTiming).use(errorsHandler);
