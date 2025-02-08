import { Elysia } from 'elysia';
import { swaggerMiddleware } from '~backend/shared/middlewares/swagger';
import { errorsHandler } from '~backend/shared/middlewares/errors';

export const middlewares = (app: Elysia) => app.use(swaggerMiddleware).use(errorsHandler);
