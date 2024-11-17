import { jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { usersTable } from '~/shared/db/schema/users';
import { SessionMetadata } from '~/auth/session';
import { pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const sessionScopeEnum = pgEnum('session_scope', ['default', 'yggdrasil']);

export const sessionsTable = pgTable('sessions', {
	id: varchar('id', { length: 24 }).primaryKey(),
	uid: varchar('uid', { length: 24 }).notNull(),
	userId: varchar('user_id', { length: 24 }).notNull(),
	scope: sessionScopeEnum('scope').notNull(),
	metadata: jsonb('metadata').$type<SessionMetadata>().notNull().default({}),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [sessionsTable.userId],
		references: [usersTable.id],
	}),
}));
