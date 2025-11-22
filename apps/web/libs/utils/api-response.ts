import type { API } from '@repo/api-client';
import { getTranslations } from 'next-intl/server';
import { Left, Right } from 'purify-ts';
import { eitherToResp } from './resp';

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

export async function mapApiError<TErrorResponse extends EdenError>(
	error: TErrorResponse | null,
): Promise<{
	error:
		| Extract<
				Exclude<TErrorResponse, { status: SuccessStatus }>,
				{ value: { error: object } }
		  >['value']['error']
		// Workaround for adding fetch-error causing typing errors.
		| { path: string; code: 'fetch-error'; message: string; details: unknown };
	message: string;
} | null> {
	if (!error) return null;
	if (error.status < 400 || error.status > 599) return null;
	if (!error.value || !('error' in error.value)) return null;

	const errorCode = error.value.error.code;
	const t = await getTranslations('common.apiErrors');
	const message = t(errorCode);

	return {
		error: error.value.error,
		message,
	};
}

export async function mapFetchError(error: unknown) {
	const t = await getTranslations('common.apiErrors');
	const message = t('fetch-error');

	const result = {
		error: {
			path: '',
			code: 'fetch-error' as const,
			message,
			details: error,
		},
		message,
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

/**
 * Wrapper function for API calls that handles error mapping and converts to Either format.
 */
export function handleResponse<
	TResponse extends { data: unknown; error: null } | { data: null; error: EdenError | null },
>(
	edenReturn: Promise<TResponse>,
): Promise<
	ReturnType<
		typeof eitherToResp<
			| NonNullable<Awaited<ReturnType<typeof mapApiError<NonNullable<TResponse['error']>>>>>
			| Awaited<ReturnType<typeof mapFetchError>>,
			NonNullable<TResponse['data']>
		>
	>
> {
	return (
		edenReturn
			.then(async ({ data, error }) => {
				const errResp = await mapApiError(error);
				if (errResp) return Left(errResp);

				return Right(data!);
			})
			.catch(async (error) => Left(await mapFetchError(error)))
			// for serialization
			.then((data) => eitherToResp(data))
	);
}
