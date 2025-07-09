import type { ElysiaOnErrorContext } from './types';
import type { Static } from 'elysia';
import { Logger } from '~backend/shared/logger';
import { APP_ERRORS } from './errors';

export class AppError<TErrorCode extends keyof typeof APP_ERRORS> extends Error {
	code = '';
	status = 0;
	details: unknown;

	constructor(
		errorCode: TErrorCode,
		// Always pass the message params before details
		...params: Parameters<(typeof APP_ERRORS)[TErrorCode]['message']> extends [
			infer TMessageParams,
		]
			? Static<(typeof APP_ERRORS)[TErrorCode]['details']> extends infer TDetails
				? [TMessageParams, TDetails]
				: [TMessageParams]
			: Static<(typeof APP_ERRORS)[TErrorCode]['details']> extends infer TDetails
				? [TDetails]
				: []
	) {
		super();
		const errorInfo = APP_ERRORS[errorCode];

		this.code = errorCode;
		this.status = errorInfo.status;

		if (errorInfo.message.length > 0) {
			// @ts-expect-error Checked with the type of `params`
			this.message = errorInfo.message.call(this, params[0]);
			if (errorInfo.details['length'] > 0) this.details = params[1];
		} else {
			this.message = errorInfo.message.call(this);
			if (errorInfo.details['length'] > 0) this.details = params[0];
		}
	}
}

export const appErrorHandler = ({
	error,
	code,
	path,
}: Pick<ElysiaOnErrorContext, 'code' | 'error' | 'path'>) => {
	if (!(error instanceof Error)) return;

	if (error instanceof AppError) {
		// [TODO] Add an cause to the error and we can log it
		if (error.code === 'internal-error') {
			Logger.error(
				error,
				`A handled unexpected error happened when handling request on ${path}`,
			);
		}

		return {
			error: {
				path,
				code,
				message: error.message,
				details: error.details,
			},
		};
	}

	switch (code) {
		case 'VALIDATION':
			return {
				error: {
					path,
					code: 'invalid-body',
					message: `The request contains invalid data. Please ensure the data is correct.`,
					details: JSON.parse(error.message) as unknown,
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
			Logger.error(error, `Unhandled error happened when handling request on ${path}`);

			return {
				error: {
					path,
					code: 'unknown-error',
					message: 'An unexpected error occurred. Please try again later.',
				},
			};
	}
};
