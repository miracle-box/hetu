import { createId } from '@paralleldrive/cuid2';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
	id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
	name: varchar('name').unique().notNull(),
	email: varchar('email').unique().notNull(),
	passwordHash: varchar('password_hash').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

export const sessionTable = pgTable('session', {
	id: varchar('id', { length: 24 }).primaryKey(),
	userId: varchar('user_id', { length: 24 })
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
