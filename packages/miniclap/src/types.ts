/* eslint-disable @typescript-eslint/no-explicit-any */

// Schema
export type Schema<TType = unknown> =
	| ((value: string, name: string, prev: TType) => TType)
	| [(value: string, name: string, prev: TType) => TType];

export type ValueType<TMaybeSchema> = TMaybeSchema extends (...args: unknown[]) => infer TValue
	? TValue
	: TMaybeSchema extends [(...args: unknown[]) => infer TValue]
		? TValue
		: never;

// Option
export type OptionInit<TNames, TShort extends string | undefined, TType> = {
	// Enforce single letter
	short?: TShort extends TNames ? never : TShort extends SingleLetters ? TShort : never;
	type: Schema<TType>;
	default?: TType;
};
export type AnyOptionInit = OptionInit<any, any, any>;

export type Option<TType = any> = {
	name: string;
	type: Schema<TType>;
	default?: TType;
};

// Argument
export type ArgumentInit<TType> = {
	type: Schema<TType>;
	default?: TType;
};
export type AnyArgumentInit = ArgumentInit<any>;

export type Argument<TType = any> = {
	name: string;
	type: Schema<TType>;
	default?: TType;
};

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
