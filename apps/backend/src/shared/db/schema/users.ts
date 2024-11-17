import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { profilesTable } from '~/shared/db/schema/profiles';
import { userAuthTable } from '~/shared/db/schema/user-auth';
import { verificationsTable } from '~/shared/db/schema/verifications';
import { sessionsTable } from '~/shared/db/schema/sessions';

export const usersTable = pgTable('users', {
	id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
	name: varchar('name').unique().notNull(),
	email: varchar('email').unique().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
	profiles: many(profilesTable),
	authMethods: many(userAuthTable),
	verifications: many(verificationsTable),
	sessions: many(sessionsTable),
}));
