/* eslint-disable @typescript-eslint/no-empty-object-type */

import type { Merge, ParseResult, Schema } from './types';
import {
	type AnyArgumentInit,
	type Argument,
	type ArgumentInit,
	parseArgumentValue,
} from './argument';
import { parseOptionValue, type AnyOptionInit, type Option, type OptionInit } from './option';

export class Clap<
	const TSubcommands extends { [name: string]: Clap } = {},
	const TOptions extends { [name: string]: AnyOptionInit } = {},
	const TShortOptions extends { [name: string]: AnyOptionInit } = {},
	const TArguments extends { [name: string]: AnyArgumentInit } = {},
> {
	private subcommands: Map<string, Clap> = new Map();
	private options: Map<string, Option> = new Map();
	private shortOptions: Map<string, Option> = new Map();
	private arguments: Map<string, Argument> = new Map();

	command<TName extends string, TClap extends Clap>(
		name: TName extends keyof TSubcommands ? never : TName,
		clap: TClap,
	): Clap<
		Merge<TSubcommands, { [K in TName]: typeof clap }>,
		TOptions,
		TShortOptions,
		TArguments
	> {
		if (this.subcommands.has(name)) throw new Error(`Subcommand ${name} is already defined.`);

		this.subcommands.set(name, clap);
		return this;
	}

	option<
		TName extends string,
		TShort extends string | undefined,
		TSchema extends Schema<unknown>,
	>(
		name: TName extends keyof TOptions ? never : TName,
		init: OptionInit<TShort, TSchema>,
	): Clap<
		TSubcommands,
		Merge<TOptions, { [K in TName]: typeof init }>,
		Merge<
			TShortOptions,
			TShort extends `${infer TShortLetter}` ? { [K in TShortLetter]: typeof init } : never
		>,
		TArguments
	> {
		const schema = {
			...init,
			name,
			// Default to false if no value provided for Boolean options.
			// @ts-expect-error BooleanConstructor is not assignable to TType, but it actually usable.
			default: init.default === undefined && init.type === Boolean ? false : init.default,
		};

		if (this.options.has(name)) throw new Error(`Option --${name} is already defined.`);
		this.options.set(name, schema);

		if (init.short) {
			if (this.shortOptions.has(init.short))
				throw new Error(
					`Short option name -${init.short} for option --${name} is already defined.`,
				);
			this.shortOptions.set(init.short, schema);
		}

		return this;
	}

	argument<TName extends string, TSchema extends Schema<unknown>>(
		name: TName extends keyof TArguments ? never : TName,
		init: ArgumentInit<TSchema>,
	): Clap<
		TSubcommands,
		TOptions,
		TShortOptions,
		Merge<TArguments, { [K in TName]: typeof init }>
	> {
		const schema = {
			...init,
			name,
		};

		if (this.arguments.has(name))
			throw new Error(`Argument with name ${name} is already defined.`);

		// Make sure optional arguments are always at the end
		const lastArg = this.arguments.values().toArray().at(-1);
		if (lastArg && lastArg.default !== undefined && init.default === undefined)
			throw new Error(
				`Defining required argument ${name} after optional arguments is not allowed.`,
			);

		// Make sure array arguments are always at the end
		if (this.arguments.values().find((arg) => Array.isArray(arg.type)))
			throw new Error(`Defining argument ${name} after array argument is not allowed.`);

		this.arguments.set(name, schema);
		return this;
	}

	parse(argv: string[]): ParseResult<typeof this> {
		// Try to parse subcommands first
		const subcommandResult = this.#parseSubcommands([], argv);

		const headOptsResult = subcommandResult.context.#parseOptions([], subcommandResult.rest[0]);
		// Deny any unrecognized arguments before the last subcommand
		if (headOptsResult.rest.length !== 0)
			throw new Error(`Invalid subcommands: ${headOptsResult.rest.join(' ')}`);

		const tailOptsResult = subcommandResult.context.#parseOptions(
			[],
			subcommandResult.rest[1],
			headOptsResult.result,
		);

		const argumentsResult = subcommandResult.context.#parseArguments(
			// Drop the `--` separator
			tailOptsResult.rest.filter((arg) => arg !== '--'),
		);

		function createResultObject(
			command: string[],
			opts: Record<string, unknown>,
			args: Record<string, unknown>,
			rest: string[],
		): unknown {
			if (command.length <= 0)
				return {
					result: {
						options: opts,
						arguments: args,
						rest,
					},
				};
			else
				return {
					// length checked above
					[command[0]!]: createResultObject(command.slice(1), opts, args, rest),
				};
		}

		return createResultObject(
			subcommandResult.path,
			tailOptsResult.result,
			argumentsResult.result,
			argumentsResult.rest,
		) as ParseResult<typeof this>;
	}

	#parseSubcommands(
		head: string[],
		tail: string[],
	): { rest: [string[], string[]]; context: Clap; path: string[] } {
		for (const [argIndex, arg] of tail.entries()) {
			const subcommand = this.subcommands.get(arg);
			if (subcommand) {
				const subResult = subcommand.#parseSubcommands(
					[...head, ...tail.slice(0, argIndex)],
					tail.slice(argIndex + 1),
				);

				return {
					path: [arg, ...subResult.path],
					context: subResult.context,
					rest: subResult.rest,
				};
			}
		}

		return {
			path: [],
			context: this,
			// Splits into 2 parts: arguments before and after the last subcommand
			rest: [head, tail],
		};
	}

	#parseOptions(
		head: string[],
		tail: string[],
		acc: Record<string, unknown> = {},
	): {
		result: Record<string, unknown>;
		rest: string[];
	} {
		for (const [argIndex, arg] of tail.entries()) {
			// Any args after -- are arguments, skip them
			if (arg.startsWith('-') && arg !== '--') {
				const isLongOption = arg.startsWith('--');

				const suppliedName = isLongOption ? arg.slice(2).split('=')?.[0] : arg.slice(1);
				if (!suppliedName) throw new Error(`Invalid option: ${arg}`);

				const option = isLongOption
					? this.options.get(suppliedName)
					: this.shortOptions.get(suppliedName);
				if (!option) throw new Error(`Unknown option: ${arg}`);

				const restHead = [...head, ...tail.slice(0, argIndex)];

				// `--option=value` style
				const probableValue = isLongOption ? arg.split('=')?.[1] : null;
				if (arg.includes('=')) {
					if (!probableValue) throw new Error(`No value provided for option: ${arg}`);

					// Parse the provided value is enough
					const { value } = parseOptionValue(acc[option.name], option, [probableValue]);
					return this.#parseOptions(restHead, tail.slice(argIndex + 1), {
						...acc,
						[option.name]: value,
					});
				}

				// `--option value` and `-o value` style
				const { value, restArgs: restTail } = parseOptionValue(
					acc[option.name],
					option,
					tail.slice(argIndex + 1),
				);
				return this.#parseOptions(restHead, restTail, {
					...acc,
					[option.name]: value,
				});
			}
		}

		return {
			// Filling the rest of the options with default values
			result: this.options
				.entries()
				.reduce<Record<string, unknown>>((result, [key, option]) => {
					if (acc[key] === undefined && option.default !== undefined)
						result[key] = option.default;
					else result[key] = acc[key];

					return result;
				}, {}),
			rest: [...head, ...tail],
		};
	}

	#parseArguments(argv: string[]): { result: Record<string, unknown>; rest: string[] } {
		const result: Record<string, unknown> = {};
		const argvIter = argv.values();

		for (const arg of this.arguments.values()) {
			const nextArgv = argvIter.next();

			const suppliedValue = nextArgv.value
				? // Collect all the values for the trailing array
					Array.isArray(arg.type)
					? [nextArgv.value, ...argvIter]
					: [nextArgv.value]
				: [];

			result[arg.name] = parseArgumentValue(arg, suppliedValue);
		}

		return {
			result,
			rest: [...argvIter],
		};
	}
}
