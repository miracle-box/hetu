import { Type } from '@sinclair/typebox';

// [TODO] These should not be here...
export const userResponseSchema = Type.Object({
	id: Type.String(),
	name: Type.String(),
	email: Type.String(),
	createdAt: Type.Date(),
	updatedAt: Type.Date(),
});

export const userProfileResponseSchema = Type.Object({
	id: Type.String(),
	authorId: Type.String(),
	name: Type.String(),
	skinTextureId: Type.Union([Type.String(), Type.Null()]),
	capeTextureId: Type.Union([Type.String(), Type.Null()]),
	isPrimary: Type.Boolean(),
});

export const userTextureResponseSchema = Type.Object({
	id: Type.String(),
	authorId: Type.String(),
	name: Type.String(),
	description: Type.String(),
	type: Type.Union([Type.Literal('cape'), Type.Literal('skin'), Type.Literal('skin_slim')]),
	hash: Type.String(),
});
