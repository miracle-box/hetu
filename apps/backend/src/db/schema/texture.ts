import { createId } from '@paralleldrive/cuid2';
import { pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { userTable } from './auth';

export const textureTypeEnum = pgEnum('texture_type', ['skin', 'skin_slim', 'cape']);

export const textureTable = pgTable('texture', {
	id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
	authorId: varchar('author_id', { length: 24 })
		.notNull()
		.references(() => userTable.id),
	name: varchar('name').notNull(),
	description: text('description').notNull().default(''),
	type: textureTypeEnum('type').notNull(),
	hash: varchar('hash').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});
