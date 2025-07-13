import { ApiErrors } from '@repo/api-client';

export type ApiError = {
	status: number;
	value:
		| {
				error: {
					code: keyof typeof ApiErrors;
					message: string;
				};
		  }
		| object;
};

type SuccessStatus =
	| 200
	| 201
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

export function mapApiError<TErrorResponse extends ApiError>(
	error: TErrorResponse | null,
): {
	error: Extract<
		Exclude<TErrorResponse, { status: SuccessStatus }>,
		{ value: { error: object } }
	>['value']['error'];
	message: string;
} | null {
	if (!error) return null;
	if (error.status < 400 || error.status > 599) return null;
	if (!('error' in error.value)) return null;

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
			code: 'fetch-error',
			message: 'Failed to fetch data.',
			details: error,
		},
		message: 'Failed to fetch data.',
	};

	console.log('Failed to fetch data:', result);

	return result;
}
