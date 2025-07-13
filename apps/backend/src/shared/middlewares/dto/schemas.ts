import type { TObject, TSchema } from '@sinclair/typebox';
import { createErrorResps } from '#shared/middlewares/errors/docs';
import { APP_ERRORS } from '#shared/middlewares/errors/errors';
import { type Prettify } from '#shared/typing/utils';

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

export function createDtoSchemas<
	const TDtoSchemas extends {
		params?: TObject;
		query?: TObject;
		body?: TSchema;
		cookie?: TObject;
		headers?: TObject;
	},
	TResponses extends Partial<Record<SuccessStatus, TSchema>>,
	TCodes extends keyof typeof APP_ERRORS,
>(request: TDtoSchemas, response: TResponses, errors: TCodes[]) {
	return {
		...request,
		response: {
			...createErrorResps(...errors),
			...response,
		} as Prettify<TResponses & ReturnType<typeof createErrorResps<TCodes>>>,
	};
}
