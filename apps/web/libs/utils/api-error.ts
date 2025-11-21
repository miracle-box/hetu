import type { API } from '@repo/api-client';

export type EdenError = {
	status: number;
	value:
		| {
				error: {
					code: keyof typeof API.ApiErrors;
					message: string;
				};
		  }
		| object
		| void;
};

type SuccessStatus =
	| 200
	| 201
	| 203
	| 202
	| 204
	| 205
	| 206
	| 207
	| 208
	| 226
	| 300
	| 301
	| 302
	| 303
	| 304
	| 305
	| 306
	| 307
	| 308;

export function mapApiError<TErrorResponse extends EdenError>(
	error: TErrorResponse | null,
): {
	error:
		| Extract<
				Exclude<TErrorResponse, { status: SuccessStatus }>,
				{ value: { error: object } }
		  >['value']['error']
		// Workaround for adding fetch-error causing typing errors.
		| { path: string; code: 'fetch-error'; message: string; details: unknown };
	message: string;
} | null {
	if (!error) return null;
	if (error.status < 400 || error.status > 599) return null;
	if (!error.value || !('error' in error.value)) return null;

	let message: string;
	switch (error.value.error.code) {
		case 'unknown-error':
			message = 'Unknown error occured.';
			break;
		case 'invalid-body':
			message = 'Invalid body.';
			break;
		case 'internal-error':
			message = 'Internal server error.';
			break;
		case 'unauthorized':
			message = 'Unauthorized.';
			break;
		case 'forbidden':
			message = 'Forbidden.';
			break;
		default:
			message = error.value.error.message;
	}

	return {
		error: error.value.error,
		message,
	};
}

export function mapFetchError(error: unknown) {
	const result = {
		error: {
			path: '',
			code: 'fetch-error',
			message: 'Failed to fetch data.',
			details: error,
		},
		message: 'Failed to fetch data.',
	} as const;

	console.log('Failed to fetch data:', result);

	return result;
}

// For use with TanStack Query
type ErrorResponse = {
	message: string;
	error: {
		path: string;
		code: string;
		message: string;
		details: unknown;
	};
};

export class ApiError extends Error {
	override cause: ErrorResponse;
	override message: string;
	code: string;

	constructor(cause: ErrorResponse) {
		super(cause.message);
		this.cause = cause;
		this.message = cause.message;
		this.code = cause.error.code;
	}
}
