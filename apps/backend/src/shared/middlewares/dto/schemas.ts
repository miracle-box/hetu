import type { TObject, TSchema } from '@sinclair/typebox';
import { createErrorResps } from '#shared/middlewares/errors/docs';
import { APP_ERRORS } from '#shared/middlewares/errors/errors';

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
>(schemas: TDtoSchemas) {
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
