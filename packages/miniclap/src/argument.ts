/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Schema, ValueType } from './types';
import { isInvalidValue } from './utils';

export type ArgumentInit<TSchema extends Schema<unknown>> = {
	type: TSchema;
	default?: ValueType<TSchema>;
};
export type AnyArgumentInit = ArgumentInit<any>;

export type Argument<TSchema = any> = {
	name: string;
	type: TSchema;
	default?: ValueType<TSchema>;
};

export function parseArgumentValue(arg: Argument, argv: string[]) {
	if (argv.length <= 0) {
		// Make sure all required arguments are provided
		if (arg.default === undefined) throw new Error(`Missing required argument: ${arg.name}`);
		else return arg.default;
	}

	const parser = Array.isArray(arg.type) ? arg.type[0] : arg.type;
	const parsedValue = Array.isArray(arg.type)
		? argv.reduce<unknown[]>((acc, cur) => {
				const item = parser(cur, arg.name, acc);
				if (isInvalidValue(item))
					throw new Error(`Invalid value for argument: ${arg.name}`);

				acc.push(item);
				return acc;
			}, [])
		: // Arguments can't be passed multiple times currently, so no previous value here
			// argv[0] existence checked above
			parser(argv[0]!, arg.name, undefined);

	if (isInvalidValue(parsedValue)) throw new Error(`Invalid value for argument: ${arg.name}`);

	return parsedValue;
}
