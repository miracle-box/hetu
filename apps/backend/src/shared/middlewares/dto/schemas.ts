import type { TObject, TSchema } from '@sinclair/typebox';
import { createErrorResps } from '../errors/docs';
import { APP_ERRORS } from '../errors/errors';

type ErrorKey = keyof typeof APP_ERRORS;

const toStatusCodes = (keys: readonly ErrorKey[]) =>
	Array.from(new Set(keys.map((k) => APP_ERRORS[k].status)));

export function createDtoSchemas<
	const TDtoSchemas extends {
		response: Record<number, TSchema>;
		params?: TObject;
		query?: TObject;
		body?: TObject;
		cookie?: TObject;
		headers?: TObject;
		errors?: readonly ErrorKey[];
	},
>(
	schemas: TDtoSchemas,
): Omit<TDtoSchemas, 'errors' | 'response'> & {
	response: TDtoSchemas['response'] &
		// Pick statuses in schemas.errors from APP_ERRORS
		ReturnType<
			typeof createErrorResps<
				TDtoSchemas['errors'] extends readonly ErrorKey[]
					? (typeof APP_ERRORS)[TDtoSchemas['errors'][number]]['status'][]
					: []
			>
		>;
} {
	const { errors = [], response, ...rest } = schemas;

	const mergedResponse = {
		...response,
		...createErrorResps(...toStatusCodes(errors)),
	};

	return {
		...rest,
		response: mergedResponse,
	};
}
