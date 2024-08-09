import { createSelectSchema } from 'drizzle-typebox';
import { Static, t } from 'elysia';
import { sessionTable } from '~/db/schema/auth';

export const sessionSchema = createSelectSchema(sessionTable);

export const sessionSummarySchema = t.Omit(sessionSchema, ['id']);

export type Session = Static<typeof sessionSchema>;
export type SessionSummary = Static<typeof sessionSummarySchema>;
