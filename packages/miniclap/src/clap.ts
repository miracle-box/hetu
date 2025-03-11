import type {
	AnyArgumentInit,
	AnyOptionInit,
	Argument,
	ArgumentInit,
	Option,
	OptionInit,
} from './types';
import { isInvalidValue } from './util';

export class Clap<
	const TSubcommands extends { name: string; config: Clap } = never,
	const TOptions extends { name: string; config: AnyOptionInit } = never,
	const TShortOptions extends { name: string; config: AnyOptionInit } = never,
	const TArguments extends { name: string; config: AnyArgumentInit } = never,
> {
	private subcommands: Map<string, Clap> = new Map();
	private options: Map<string, Option> = new Map();
	private shortOptions: Map<string, Option> = new Map();
	private arguments: Map<string, Argument> = new Map();

	command<TName extends string>(
		name: TName extends TSubcommands['name'] ? never : TName,
		clap: Clap,
	): Clap<
		TSubcommands | { name: TName; config: typeof clap },
		TOptions,
		TShortOptions,
		TArguments
	> {
		if (this.subcommands.has(name)) throw new Error(`Subcommand ${name} is already defined.`);

		this.subcommands.set(name, clap);
		return this;
	}

	option<TName extends string, TShort extends string | undefined, TType>(
		name: TName extends TOptions['name'] ? never : TName,
		init: OptionInit<TShortOptions['name'], TShort, TType>,
	): Clap<
		TSubcommands,
		TOptions | { name: TName; config: typeof init },
		| TShortOptions
		| (TShort extends `${infer TShortLetter}`
				? { name: TShortLetter; config: typeof init }
				: never),
		TArguments
	> {
		const schema = {
			name,
			...init,
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

	argument<TName extends string, TType>(
		name: TName extends TArguments['name'] ? never : TName,
		init: ArgumentInit<TType>,
	): Clap<
		TSubcommands,
		TOptions,
		TShortOptions,
		TArguments | { name: TName; config: typeof init }
	> {
		const schema = {
			name,
			...init,
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

	parse(argv: string[]) {
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

		return {
			command: subcommandResult.path,
			options: tailOptsResult.result,
			arguments: argumentsResult.result,
			rest: argumentsResult.rest,
		};
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
		// Extract values based on the options
		function parseValue(
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
					const { value } = parseValue(acc[option.name], option, [probableValue]);
					return this.#parseOptions(restHead, tail.slice(argIndex + 1), {
						...acc,
						[option.name]: value,
					});
				}

				// `--option value` and `-o value` style
				const { value, restArgs: restTail } = parseValue(
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
			result: acc,
			rest: [...head, ...tail],
		};
	}

	#parseArguments(argv: string[]): { result: Record<string, unknown>; rest: string[] } {
		const result: Record<string, unknown> = {};
		const argvIter = argv.values();

		function parseValue(arg: Argument, argv: string[]) {
			if (argv.length <= 0) {
				// Make sure all required arguments are provided
				if (arg.default === undefined)
					throw new Error(`Missing required argument: ${arg.name}`);
				else return arg.default;
			}

			const parser = Array.isArray(arg.type) ? arg.type[0] : arg.type;
			const parsedValue = Array.isArray(arg.type)
				? argv.reduce<unknown[]>((acc, cur) => {
						const item = parser(cur, arg.name, result);
						if (isInvalidValue(item))
							throw new Error(`Invalid value for argument: ${arg.name}`);

						acc.push(item);
						return acc;
					}, [])
				: // Argument existence checked above
					parser(argv[0]!, arg.name, result);

			if (isInvalidValue(parsedValue))
				throw new Error(`Invalid value for argument: ${arg.name}`);

			return parsedValue;
		}

		for (const arg of this.arguments.values()) {
			const nextArgv = argvIter.next();

			const providedValue = nextArgv.value
				? // Collect all the values for the trailing array
					Array.isArray(arg.type)
					? [nextArgv.value, ...argvIter]
					: [nextArgv.value]
				: [];

			result[arg.name] = parseValue(arg, providedValue);

			console.log(arg.name, nextArgv.value);
		}

		return {
			result,
			rest: [...argvIter],
		};
	}
}
