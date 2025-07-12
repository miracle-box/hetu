import { Elysia } from 'elysia';
import { Config } from '#config';
import { AppError, appErrorHandler } from '#shared/middlewares/errors/app-error';
import { yggdrasilErrorHandler } from '#shared/middlewares/errors/yggdrasil-error';
import { onErrorLogger } from '#shared/middlewares/logger';

/**
 * Error handling middleware.
 *
 * * Runs error handlers manually prevents Elysia's `.onError()` from not being executed.
 */
export const errorsMiddleware = (app: Elysia) =>
	app
		.error({
			AppError,
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
