import { createId } from '@paralleldrive/cuid2';
import { eq, sql } from 'drizzle-orm';
import { pgEnum, pgTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const userAuthTypeEnum = pgEnum('auth_type', ['password']);

export const userTable = pgTable('user', {
	id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
	name: varchar('name').unique().notNull(),
	email: varchar('email').unique().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

export const userAuthTable = pgTable(
	'user_auth',
	{
		id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
		userId: varchar('user_id', { length: 24 })
			.notNull()
			.references(() => userTable.id),
		type: userAuthTypeEnum('type').notNull(),
		credential: varchar('credential').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
	},
	(t) => ({
		// Only one password for each user
		uniquePassword: uniqueIndex('unique_password')
			.on(t.userId, t.type)
			// Workaround for drizzle-orm #2506
			.where(sql`"user_auth"."type" = 'password'`),
	}),
);

export const sessionTable = pgTable('session', {
	id: varchar('id', { length: 24 }).primaryKey(),
	userId: varchar('user_id', { length: 24 })
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
