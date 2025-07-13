import { t, type TSchema } from 'elysia';
import { APP_ERRORS } from '#shared/middlewares/errors/errors';

export const errorResponseSchema = <TCode extends keyof typeof APP_ERRORS>(code: TCode) =>
	t.Object({
		error: t.Object(
			{
				path: t.String({ description: 'Path of the requesst.' }),
				code: t.Literal(code, { description: 'Error code (machine readable).' }),
				message: t.String({ description: 'Error message (human readable).' }),
				details: APP_ERRORS[code].details,
			},
			{
				description: 'Error response.',
				default: {
					path: '(Request path)',
					code: code,
					message: '(Error message)',
					details: null,
				},
			},
		),
	});

/**
 * Create document for error responses of a endpoint
 *
 * `500 Internal Server Error` and `422 Unprocessable Entity` are included by default.
 *
 * @param codes - Error codes
 * @returns error responses object for Elysia
 */
export const createErrorResps = <TCodes extends keyof typeof APP_ERRORS>(...codes: TCodes[]) => {
	type TStatus = (typeof APP_ERRORS)[TCodes]['status'] | 500 | 422;
	type TErrorSchema =
		| ReturnType<typeof errorResponseSchema<TCodes>>
		| ReturnType<typeof errorResponseSchema<'unknown-error'>>
		| ReturnType<typeof errorResponseSchema<'invalid-body'>>;

	const rawErrorsSchemas: Map<TStatus, Set<TErrorSchema>> = new Map([
		[500, new Set([errorResponseSchema('unknown-error') as TErrorSchema])],
		[422, new Set([errorResponseSchema('invalid-body') as TErrorSchema])],
	]);

	for (const code of codes) {
		if (!rawErrorsSchemas.has(APP_ERRORS[code].status)) {
			rawErrorsSchemas.set(APP_ERRORS[code].status, new Set());
		}

		rawErrorsSchemas.get(APP_ERRORS[code].status)?.add(errorResponseSchema(code));
	}

	const errorsSchemas = Array.from(rawErrorsSchemas).reduce(
		(acc, [status, schemas]) => {
			acc[status] =
				schemas.size > 1
					? t.Union([...schemas])
					: (schemas.values().next().value ?? t.Void());
			return acc;
		},
		{} as Record<TStatus, TSchema>,
	);

	// It's hard to infer the exact error codes.
	return { ...errorsSchemas } as unknown as {
		[K in TStatus]: TErrorSchema;
	};
};
