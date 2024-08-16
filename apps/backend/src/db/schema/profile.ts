import { varchar, timestamp, uuid, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { userTable } from './auth';
import { textureTable } from './texture';
import { sql } from 'drizzle-orm';
import { lower } from './utils';

export const profileTable = pgTable(
	'profile',
	{
		// Use UUID for profile ids
		id: uuid('id').primaryKey().defaultRandom(),
		authorId: varchar('author_id', { length: 24 })
			.notNull()
			.references(() => userTable.id),
		name: varchar('name').notNull(),
		skinTextureId: varchar('skin_texture_id', { length: 24 }).references(() => textureTable.id),
		capeTextureId: varchar('cape_texture_id', { length: 24 }).references(() => textureTable.id),
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
		// Player name is case insensitive in Minecraft
		uniqueLowercaseName: uniqueIndex('unique_lowercase_name').on(lower(t.name)),
	}),
);
