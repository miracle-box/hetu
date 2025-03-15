/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SingleLetters, Schema, ValueType } from './types';

export type OptionInit<TShort extends string | undefined, TSchema extends Schema<unknown>> = {
	// Enforce single letter
	short?: TShort extends SingleLetters ? TShort : never;
	type: TSchema;
	default?: ValueType<TSchema>;
};

export type AnyOptionInit = OptionInit<any, any>;

export type Option<TSchema = any> = {
	name: string;
	type: TSchema;
	default?: ValueType<TSchema>;
};

export function parseOptionValue(
	prev: unknown,
	option: Option,
	argv: string[],
): { value: unknown; restArgs: string[] } {
	// Flags
	if (option.type === Boolean) {
		return {
			value: true,
			restArgs: argv,
		};
	}

	// Not flags, should read value
	if (!argv[0] || argv[0].startsWith('-'))
		throw new Error(`No value provided for option: ${option.name}`);

	const parser = Array.isArray(option.type) ? option.type[0] : option.type;
	const parsedValue = parser(argv[0], option.name, prev);

	// Deny nullish values
	if (
		parsedValue === undefined ||
		parsedValue === null ||
		(typeof parsedValue === 'number' && isNaN(parsedValue))
	) {
		throw new Error(`Invalid value for option: ${option.name}`);
	}

	const value = Array.isArray(option.type)
		? Array.isArray(prev)
			? [...prev, parsedValue]
			: [parsedValue]
		: parsedValue;

	return {
		value,
		restArgs: argv.slice(1),
	};
}
