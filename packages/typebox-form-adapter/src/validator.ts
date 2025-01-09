import type { ValidationError, Validator, ValidatorAdapterParams } from '@tanstack/form-core';
import type { TSchema } from '@sinclair/typebox';
import type { ValueError } from '@sinclair/typebox/value';
import { Value } from '@sinclair/typebox/value';

type Params = ValidatorAdapterParams<ValueError>;
type TransformFn = NonNullable<Params['transformErrors']>;

/**
 * Transforms a JSON Pointer to a dot notation path
 * @param pointer - JSON Pointer
 */
function transformPath(pointer: string) {
	if (!pointer.startsWith('/')) throw new Error('Invalid JSON Pointer');

	// Split by '/', ignoring the first empty element
	// Then, unescape any '~' characters
	const tokens = pointer
		.split('/')
		.slice(1)
		.map((token) => token.replace(/~1/g, '/').replace(/~0/g, '~'));

	let dotNotation = '';
	tokens.forEach((token) => {
		if (/^\d+$/.test(token)) {
			// Array index
			dotNotation += `[${token}]`;
		} else {
			// Object key
			if (dotNotation.length > 0 && !dotNotation.endsWith(']')) dotNotation += '.';

			// Handle keys with special characters by quoting if necessary
			if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(token)) dotNotation += token;
			else dotNotation += `["${token.replace(/"/g, '\\"')}"]`;
		}
	});
	return dotNotation;
}

export function prefixSchemaToErrors(valueErrors: ValueError[], transformErrors: TransformFn) {
	const schema = new Map<string, ValueError[]>();

	for (const valueError of valueErrors) {
		if (!valueError.path) continue;

		const path = transformPath(valueError.path);
		schema.set(path, (schema.get(path) ?? []).concat(valueError));
	}

	const transformedSchema = {} as Record<string, ValidationError>;

	schema.forEach((value, key) => {
		transformedSchema[key] = transformErrors(value);
	});

	return transformedSchema;
}

export function defaultFormTransformer(transformErrors: TransformFn) {
	return (errors: ValueError[]) => ({
		form: transformErrors(errors),
		fields: prefixSchemaToErrors(errors, transformErrors),
	});
}

export const typeboxValidator =
	(params: Params = {}): Validator<unknown, TSchema> =>
	() => {
		const transformFieldErrors =
			params.transformErrors ??
			((issues: ValueError[]) => issues.map((issue) => issue.message).join(', '));

		const getTransformStrategy = (validationSource: 'form' | 'field') =>
			validationSource === 'form'
				? defaultFormTransformer(transformFieldErrors)
				: transformFieldErrors;

		return {
			validate({ value, validationSource }, fn) {
				const [...result] = Value.Errors(fn, value);
				if (result.length <= 0) return;

				const transformer = getTransformStrategy(validationSource);
				return transformer(result);
			},
			async validateAsync({ value, validationSource }, fn) {
				const [...result] = Value.Errors(fn, value);
				if (result.length <= 0) return;

				const transformer = getTransformStrategy(validationSource);
				return transformer(result);
			},
		};
	};
