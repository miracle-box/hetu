import { Static, t } from 'elysia';

export const userSchema = t.Object({
	id: t.String(),
	name: t.String(),
	email: t.String(),
});

export type User = Static<typeof userSchema>;
