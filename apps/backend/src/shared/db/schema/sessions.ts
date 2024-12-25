import { jsonb, pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { SessionMetadata } from '~/services/auth/session';

export const sessionScopeEnum = pgEnum('session_scope', ['default', 'yggdrasil']);

export const sessionsTable = pgTable('sessions', {
	id: varchar('id', { length: 24 }).primaryKey(),
	uid: varchar('uid', { length: 24 }).notNull(),
	userId: varchar('user_id', { length: 24 }).notNull(),
	scope: sessionScopeEnum('scope').notNull(),
	metadata: jsonb('metadata').$type<SessionMetadata['metadata']>().notNull().default({}),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
