import type { SessionMetadata } from '~backend/modules/auth/auth.entities';
import { createId } from '@paralleldrive/cuid2';
import { jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const sessionsTable = pgTable('sessions', {
	id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
	token: varchar('token', { length: 24 }).notNull().$defaultFn(createId),
	userId: varchar('user_id', { length: 24 }).notNull(),
	metadata: jsonb('metadata').$type<SessionMetadata>().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
