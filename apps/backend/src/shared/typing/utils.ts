import { Type, TUnion, TLiteral } from '@sinclair/typebox';

/**
 * Make your dev experience better.
 */
export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

/**
 * Represents a enum-like object
 */
type EnumLike = { readonly [key: string]: string | number };

/**
 * Create a union of literal types from an enum-like object.
 */
export type EnumLikeValues<TEnumLike extends EnumLike> = TEnumLike[keyof TEnumLike];

/**
 * Create a TypeBox schema of union of literal types from an enum-like object.
 * @param enumLike - the enum-like object
 * @returns TypeBox literal union
 */
export function createEnumLikeValuesSchema<TEnumLike extends EnumLike>(
	enumLike: TEnumLike,
): TUnion<TLiteral<TEnumLike[keyof TEnumLike]>[]> {
	return Type.Union(
		Object.values(enumLike).map((v) => Type.Literal(v as TEnumLike[keyof TEnumLike])),
	);
}

/**
 * Checks whether a value is an object and whether a prop is in the object.
 * @param obj Value to check
 * @param prop Desired property to check for
 */
export function hasProperty<K extends string>(
	obj: unknown,
	prop: K,
): obj is { [key in K]: unknown } {
	return typeof obj === 'object' && obj !== null && prop in obj;
}
