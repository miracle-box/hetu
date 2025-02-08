import Elysia from 'elysia';

class YggdrasilApiError extends Error {
	status = 500;
	code = 'UNKNOWN';
	message = 'Unknown Error';

	constructor(message: string) {
		super(message);
	}
}

export class NotFoundError extends YggdrasilApiError {
	status = 404;
	code = 'NOT_FOUND';
	message = 'Not Found';

	constructor(message: string) {
		super(message);
	}
}

export class ForbiddenOperationException extends YggdrasilApiError {
	status = 403;
	code = 'ForbiddenOperationException';
	message = '';

	constructor(message: string) {
		super(message);
		this.message = message;
	}
}

export class IllegalArgumentException extends YggdrasilApiError {
	status = 400;
	message = '';

	constructor(message: string) {
		super(message);
		this.message = message;
	}
}

export const yggdrasilErrorsHandler = (app: Elysia) =>
	app
		.error({
			NotFoundError,
			ForbiddenOperationException,
			IllegalArgumentException,
		})
		.onError(({ error, code, path }) => {
			if (!(error instanceof Error)) return;

			switch (code) {
				case 'IllegalArgumentException':
				case 'ForbiddenOperationException':
				case 'NotFoundError':
					return {
						path,
						error: error.code,
						errorMessage: error.message,
					};
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
				default:
					return {
						path,
						error: 'UNKNOWN',
						errorMessage: 'Unknown error.',
					};
			}
		});
