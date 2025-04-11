import { t } from 'elysia';

export const errorResponseSchema = t.Object({
	error: t.Object(
		{
			path: t.String({ description: 'Path of the requesst.' }),
			code: t.String({ description: 'Error code (machine readable).' }),
			message: t.String({ description: 'Error message (human readable).' }),
			details: t.Optional(
				t.Unknown({ description: 'Details of the error, varies depending on the error.' }),
			),
		},
		{
			description: 'Error response.',
		},
	),
});

/**
 * Create document for error responses of a endpoint
 *
 * `500 Internal Server Error` is included by default.
 *
 * `422 Unprocessable Entity` is included by default.
 * ? It is a workaround for Elysia infers VALIDATION error type wrongly,
 * ? but I think this error code should be documented as well.
 *
 * @param codes - Error codes (except 500)
 * @returns error responses object for Elysia
 *
 * @example
 * Create error response docs for a endpoint
 * ```ts
 * {
 *   responses: {
 *     200: successResp,
 *     ...createErrorResps(400, 401, 403)
 *   }
 * }
 * ```
 */
export const createErrorResps = <TCodes extends number[]>(...codes: TCodes) => {
	const completeCodes = codes.concat([422, 500]);
	return Object.fromEntries(completeCodes.map((code) => [code, errorResponseSchema])) as {
		[K in TCodes[number] | 500 | 422]: typeof errorResponseSchema;
	};
};
