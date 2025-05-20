import { Elysia } from 'elysia';
import { Config } from '~backend/shared/config';
import { onErrorLogger } from '~backend/shared/middlewares/logger';
import { AppError, appErrorHandler } from './app-error';
import {
	ForbiddenOperationException,
	IllegalArgumentException,
	NotFoundError,
	yggdrasilErrorHandler,
} from './yggdrasil-error';

/**
 * Error handling middleware.
 *
 * * Runs error handlers manually prevents Elysia's `.onError()` from not being executed.
 */
export const errorsMiddleware = (app: Elysia) =>
	app
		.error({
			AppError,
			NotFoundError,
			ForbiddenOperationException,
			IllegalArgumentException,
		})
		.onError((ctx) => {
			let response;
			if (ctx.path.startsWith('/yggdrasil')) {
				response = yggdrasilErrorHandler({
					error: ctx.error,
					code: ctx.code,
					path: ctx.path,
				});
			} else {
				response = appErrorHandler({
					error: ctx.error,
					code: ctx.code,
					path: ctx.path,
				});
			}

			if (Config.logging.logRequests) {
				onErrorLogger({ ...ctx, response: response ?? ctx.response });
			}

			return response;
		});
