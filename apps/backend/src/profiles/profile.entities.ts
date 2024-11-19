import { Static, t } from 'elysia';

export const profileSchema = t.Object({
	id: t.String(),
	authorId: t.String(),
	name: t.String(),
	skinTextureId: t.Nullable(t.String()),
	capeTextureId: t.Nullable(t.String()),
	isPrimary: t.Boolean(),
});

export type Profile = Static<typeof profileSchema>;
