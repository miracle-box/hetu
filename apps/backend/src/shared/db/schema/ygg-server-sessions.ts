import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const yggServerSessionsTable = pgTable('ygg_server_sessions', {
	serverId: varchar('server_id').primaryKey(),
	// [TODO] Probably record token ID only?
	accessToken: varchar('access_token', { length: 24 }).notNull(),
	clientIp: varchar('client_ip'),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
