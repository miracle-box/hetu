import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const yggServerSessionsTable = pgTable('ygg_server_sessions', {
	serverId: varchar('server_id').primaryKey(),
	accessToken: varchar('access_token').notNull(),
	clientIp: varchar('client_ip'),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
