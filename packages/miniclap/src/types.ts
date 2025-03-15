import type { AnyArgumentInit } from './argument';
import type { Clap } from './clap';
import type { AnyOptionInit } from './option';

type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type Merge<TOrig extends object, TNew extends object> = Prettify<{
	[K in keyof TOrig | keyof TNew]: K extends keyof TNew
		? TNew[K]
		: K extends keyof TOrig
			? TOrig[K]
			: never;
}>;

// Schema
export type Schema<TValue> =
	| [(value: string, name: string, prev: unknown) => TValue]
	| ((value: string, name: string, prev: unknown) => TValue);

export type ValueType<TSchema> = TSchema extends [(...arg: unknown[]) => infer TValue]
	? TValue[]
	: TSchema extends (...arg: unknown[]) => infer TValue
		? TValue
		: never;

// Parse
export type ParseResult<TClap extends Clap> =
	TClap extends Clap<
		infer TSubcommands extends { [K: string]: Clap },
		infer TOptions extends { [K: string]: AnyOptionInit },
		infer _TShortOptions,
		infer TArguments extends { [K: string]: AnyArgumentInit }
	>
		? Prettify<
				{
					[K in keyof TSubcommands]?: ParseResult<TSubcommands[K]>;
				} & {
					result?: {
						options: {
							[K in keyof TOptions]: ValueType<TOptions[K]['type']>;
						};
						arguments: {
							[K in keyof TArguments]: ValueType<TArguments[K]['type']>;
						};
					};
				}
			>
		: 'Provide a valid Clap instance please.';

// Schema
export type SingleLetters =
	| 'A'
	| 'B'
	| 'C'
	| 'D'
	| 'E'
	| 'F'
	| 'G'
	| 'H'
	| 'I'
	| 'J'
	| 'K'
	| 'L'
	| 'M'
	| 'N'
	| 'O'
	| 'P'
	| 'Q'
	| 'R'
	| 'S'
	| 'T'
	| 'U'
	| 'V'
	| 'W'
	| 'X'
	| 'Y'
	| 'Z'
	| 'a'
	| 'b'
	| 'c'
	| 'd'
	| 'e'
	| 'f'
	| 'g'
	| 'h'
	| 'i'
	| 'j'
	| 'k'
	| 'l'
	| 'm'
	| 'n'
	| 'o'
	| 'p'
	| 'q'
	| 'r'
	| 's'
	| 't'
	| 'u'
	| 'v'
	| 'w'
	| 'x'
	| 'y'
	| 'z';
