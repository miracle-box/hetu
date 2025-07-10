import { Type, type Static } from '@sinclair/typebox';

// User entity
export const userSchema = Type.Object({
	id: Type.String(),
	name: Type.String(),
	email: Type.String(),
	createdAt: Type.Date(),
	updatedAt: Type.Date(),
});

export type User = Static<typeof userSchema>;
