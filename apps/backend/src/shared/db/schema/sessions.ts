import { jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { SessionMetadata } from '~backend/auth/auth.entities';

export const sessionsTable = pgTable('sessions', {
	id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
	token: varchar('token', { length: 24 }).notNull().$defaultFn(createId),
	userId: varchar('user_id', { length: 24 }).notNull(),
	metadata: jsonb('metadata').$type<SessionMetadata>().notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
