import type { AuthMetadata } from '~backend/modules/auth/auth.entities';
import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { jsonb, pgEnum, pgTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const userAuthTypeEnum = pgEnum('auth_type', ['password', 'oauth2']);

export const userAuthTable = pgTable(
	'user_auth',
	{
		id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
		userId: varchar('user_id', { length: 24 }).notNull(),
		type: userAuthTypeEnum('type').notNull(),
		provider: varchar('provider'),
		credential: varchar('credential').notNull(),
		metadata: jsonb('metadata').$type<AuthMetadata>(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
	},
	(t) => [
		// Only one password for each user
		uniqueIndex('unique_password')
			.on(t.userId)
			// Workaround for drizzle-orm #2506
			.where(sql`"user_auth"."type" = 'password'`),
		// Only one remote account per provider for a user
		uniqueIndex('unique_oauth2_user')
			.on(t.userId, t.provider)
			.where(sql`"user_auth"."type" = 'oauth2'`),
		// Ensure only one bound record exists for an OAuth2 account
		uniqueIndex('unique_oauth2_target')
			.on(t.provider, t.credential)
			.where(sql`"user_auth"."type" = 'oauth2'`),
	],
);
