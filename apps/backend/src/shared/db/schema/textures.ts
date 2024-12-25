import { createId } from '@paralleldrive/cuid2';
import { pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const textureTypeEnum = pgEnum('texture_type', ['cape', 'skin', 'skin_slim']);

export const texturesTable = pgTable('textures', {
	id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
	authorId: varchar('author_id', { length: 24 }).notNull(),
	name: varchar('name').notNull(),
	description: text('description').notNull().default(''),
	type: textureTypeEnum('type').notNull(),
	hash: varchar('hash', { length: 64 }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});
