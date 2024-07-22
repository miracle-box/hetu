import { Static, t } from 'elysia';

export const sessionSchema = t.Object({
	id: t.String(),
	uid: t.String(),
	userId: t.String(),
	expiresAt: t.Date(),
});

export const sessionSummarySchema = t.Omit(sessionSchema, ['id']);

export type Session = Static<typeof sessionSchema>;
export type SessionSummary = Static<typeof sessionSummarySchema>;
