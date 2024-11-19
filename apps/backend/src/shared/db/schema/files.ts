import { bigint, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const filesTable = pgTable('files', {
	hash: varchar('hash', { length: 64 }).primaryKey(),
	size: bigint('size', { mode: 'number' }).notNull(),
	type: varchar('type').notNull(),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
});
