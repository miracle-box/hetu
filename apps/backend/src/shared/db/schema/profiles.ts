import { boolean, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { texturesTable } from './textures';
import { relations, sql } from 'drizzle-orm';
import { lower } from '../utils';
import { usersTable } from '~/shared/db/schema/users';

export const profilesTable = pgTable(
	'profiles',
	{
		// Use UUID for profile ids
		id: uuid('id').primaryKey().defaultRandom(),
		authorId: varchar('author_id', { length: 24 })
			.notNull()
			.references(() => usersTable.id),
		name: varchar('name').notNull(),
		skinTextureId: varchar('skin_texture_id', { length: 24 }),
		capeTextureId: varchar('cape_texture_id', { length: 24 }),
		isPrimary: boolean('is_primary').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
	},
	(t) => ({
		// Only one primary profile for each user
		uniquePrimaryProfile: uniqueIndex('unique_primary_profile')
			.on(t.authorId)
			// Workaround for drizzle-orm #2506
			.where(sql`"profile"."is_primary" = TRUE`),
		// Ensures that the player name is unique and player name is case-insensitive in Minecraft
		uniqueLowercaseName: uniqueIndex('unique_lowercase_name').on(lower(t.name)),
	}),
);

export const profilesRelations = relations(profilesTable, ({ one }) => ({
	author: one(usersTable, {
		fields: [profilesTable.authorId],
		references: [usersTable.id],
	}),
	skinTexture: one(texturesTable, {
		fields: [profilesTable.skinTextureId],
		references: [texturesTable.id],
	}),
	capeTexture: one(texturesTable, {
		fields: [profilesTable.capeTextureId],
		references: [texturesTable.id],
	}),
}));
