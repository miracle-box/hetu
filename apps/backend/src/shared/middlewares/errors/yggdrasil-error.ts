import type { ElysiaOnErrorContext } from './types';
import { Logger } from '~backend/shared/logger';

class YggdrasilError extends Error {
	status = 500;
	code = 'UNKNOWN';
	override message = 'Unknown Error';

	constructor(message: string) {
		super(message);
	}
}

export class InternalError extends YggdrasilError {
	override status = 500;
	override code = 'INTERNAL_ERROR';
	override message = 'Internal Error';

	constructor(cause?: unknown) {
		super('Internal Error');
		this.cause = cause;
	}
}

export class NotFoundError extends YggdrasilError {
	override status = 404;
	override code = 'NOT_FOUND';
	override message = 'Not Found';

	constructor(message: string) {
		super(message);
	}
}

export class ForbiddenOperationException extends YggdrasilError {
	override status = 403;
	override code = 'ForbiddenOperationException';
	override message = '';

	constructor(message: string) {
		super(message);
		this.message = message;
	}
}

export class IllegalArgumentException extends YggdrasilError {
	override status = 400;
	override message = '';

	constructor(message: string) {
		super(message);
		this.message = message;
	}
}

export const yggdrasilErrorHandler = ({
	error,
	code,
	path,
}: Pick<ElysiaOnErrorContext, 'code' | 'error' | 'path'>) => {
	if (!path.startsWith('/yggdrasil')) return;
	if (!(error instanceof Error)) return;

	if (error instanceof YggdrasilError) {
		return {
			path,
			error: error.code,
			errorMessage: error.message,
		};
	}

	switch (code) {
		case 'PARSE':
		case 'VALIDATION':
			return {
				path,
				error: 'IllegalArgumentException',
				errorMessage: 'Invalid argument.',
			};
		case 'NOT_FOUND':
			return {
				path,
				error: 'NOT_FOUND',
				errorMessage: 'Not Found',
			};
		case 'INTERNAL_ERROR':
			// [TODO] Add an cause to the error and we can log it
			Logger.error(error, `Internal error happened when handling request on ${path}`);

			return {
				path,
				error: 'INTERNAL_ERROR',
				errorMessage: 'Internal Error',
			};
		default:
			Logger.error(error, `Unhandled error happened when handling request on ${path}`);

			return {
				path,
				error: 'UNKNOWN',
				errorMessage: 'Unknown error.',
			};
	}
};
