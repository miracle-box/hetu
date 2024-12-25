import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const usersTable = pgTable('users', {
	id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
	name: varchar('name').unique().notNull(),
	email: varchar('email').unique().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});
