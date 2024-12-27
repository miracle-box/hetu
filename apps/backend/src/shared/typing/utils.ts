import { Type, TUnion, TLiteral } from '@sinclair/typebox';

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
