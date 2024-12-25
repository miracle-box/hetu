import { boolean, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { lower } from '../utils';

export const profilesTable = pgTable(
	'profiles',
	{
		// Use UUID for profile ids
		id: uuid('id').primaryKey().defaultRandom(),
		authorId: varchar('author_id', { length: 24 }).notNull(),
		name: varchar('name').notNull(),
		skinTextureId: varchar('skin_texture_id', { length: 24 }),
		capeTextureId: varchar('cape_texture_id', { length: 24 }),
		isPrimary: boolean('is_primary').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
	},
	(t) => ({
		// Only one primary profile for each user
		// Workaround for drizzle-orm #2506
		uniquePrimaryProfile: uniqueIndex('unique_primary_profile')
			.on(t.authorId)
			.where(sql`"profiles"."is_primary" = TRUE`),
		// Ensures that the player name is unique and player name is case-insensitive in Minecraft
		uniqueLowercaseName: uniqueIndex('unique_lowercase_name').on(lower(t.name)),
	}),
);
