import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const yggdrasilJoinServerTable = pgTable('yggdrasil_join_server', {
	serverId: varchar('server_id').primaryKey(),
	accessToken: varchar('access_token', { length: 24 }).notNull(),
	clientIp: varchar('client_ip'),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
