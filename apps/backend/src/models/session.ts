import { createSelectSchema } from 'drizzle-typebox';
import { Static, t } from 'elysia';
import { sessionTable } from '~/db/schema/auth';

const sessionSelectSchema = createSelectSchema(sessionTable);

export const sessionMetadataSchema = t.Object({
	clientToken: t.Optional(t.String()),
});

// drizzle-typebox can not infer type from jsonb fileds.
export const sessionSchema = t.Composite([
	t.Omit(sessionSelectSchema, ['metadata']),
	t.Object({ metadata: sessionMetadataSchema }),
]);

export const sessionSummarySchema = t.Omit(sessionSchema, ['id']);

export type SessionMetadata = Static<typeof sessionMetadataSchema>;
export type Session = Static<typeof sessionSchema>;
export type SessionSummary = Static<typeof sessionSummarySchema>;
