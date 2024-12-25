import { pgEnum, pgTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';

export const userAuthTypeEnum = pgEnum('auth_type', ['password']);

export const userAuthTable = pgTable(
	'user_auth',
	{
		id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
		userId: varchar('user_id', { length: 24 }).notNull(),
		type: userAuthTypeEnum('type').notNull(),
		credential: varchar('credential').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
	},
	(t) => ({
		// Only one password for each user
		uniquePassword: uniqueIndex('unique_password')
			.on(t.userId)
			// Workaround for drizzle-orm #2506
			.where(sql`"user_auth"."type" = 'password'`),
	}),
);
