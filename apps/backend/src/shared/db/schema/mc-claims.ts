import { createId } from '@paralleldrive/cuid2';
import { pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

export const skinTextureVariantEnum = pgEnum('skin_texture_variant', ['classic', 'slim']);

export const mcClaimsTable = pgTable(
	'mc_claims',
	{
		id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
		userId: varchar('user_id', { length: 24 }).notNull(),
		mcUuid: uuid('mc_uuid').notNull(),
		mcUsername: varchar('mc_username').notNull(),
		skinTextureUrl: varchar('skin_texture_url'),
		skinTextureVariant: skinTextureVariantEnum('skin_texture_variant'),
		capeTextureUrl: varchar('cape_texture_url'),
		capeTextureAlias: varchar('cape_texture_alias'),
		boundProfileId: varchar('bound_profile_id', { length: 24 }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		// Minecraft UUID should be unique
		uniqueIndex('unique_mc_uuid').on(t.mcUuid),
	],
);
