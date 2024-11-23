import { createId } from '@paralleldrive/cuid2';
import { pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { usersTable } from '~/shared/db/schema/users';
import { relations } from 'drizzle-orm';
import { TextureType } from '~/textures/texture.entities';

export const textureTypeEnum = pgEnum('texture_type', [
	TextureType.SKIN,
	TextureType.SKIN_SLIM,
	TextureType.CAPE,
]);

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

export const texturesRelations = relations(texturesTable, ({ one }) => ({
	author: one(usersTable, {
		fields: [texturesTable.authorId],
		references: [usersTable.id],
	}),
}));
