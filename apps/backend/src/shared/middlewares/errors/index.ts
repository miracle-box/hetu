import { Elysia } from 'elysia';
import { Logger } from '~backend/shared/logger';
import { AppError } from '~backend/shared/middlewares/errors/app-error';

export const errorsHandler = (app: Elysia) =>
	app.error({ AppError }).onError(({ error, code, path }) => {
		if (!(error instanceof Error)) return;

		if (error instanceof AppError)
			return {
				error: {
					path,
					code,
					message: error.message,
					details: error.details,
				},
			};

		switch (code) {
			case 'VALIDATION':
				return {
					error: {
						path,
						code: 'invalid-body',
						message: `The request contains invalid data. Please ensure the data is correct.`,
						details: JSON.parse(error.message),
					},
				};
			case 'NOT_FOUND':
				return {
					error: {
						path,
						code: 'not-found',
						message:
							'The requested path could not be found. Please check the URL and try again.',
					},
				};
			case 'PARSE':
				return {
					error: {
						path,
						code: 'malformed-body',
						message:
							'The request body format is invalid. Please ensure the body is properly formatted.',
					},
				};
			case 'INVALID_COOKIE_SIGNATURE':
				return {
					error: {
						path,
						code: 'invalid-cookie-signature',
						message:
							'The cookie signature is invalid. Please clear your cookies or sign in again.',
					},
				};
			default:
				// [TODO] Add request ID for tracing
				Logger.error(error, `Error happened when handling request on ${path}`);

				return {
					error: {
						path,
						code: 'unknown-error',
						message: 'An unexpected error occurred. Please try again later.',
					},
				};
		}
	});
