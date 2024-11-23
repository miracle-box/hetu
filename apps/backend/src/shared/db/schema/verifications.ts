import { jsonb, pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { usersTable } from '~/shared/db/schema/users';
import { relations } from 'drizzle-orm';

export const verificationMethodEnum = pgEnum('verification_method', ['email']);

export const verificationsTable = pgTable('verifications', {
	id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
	userId: varchar('user_id', { length: 24 }),
	method: verificationMethodEnum('method').notNull(),
	secret: varchar('secret').notNull(),
	// I don't know it's useful or not.
	// [TODO] Should be VerificationMetadata here, but needs inspection.
	metadata: jsonb('metadata').$type<null>().notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const verificationsRelations = relations(verificationsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [verificationsTable.userId],
		references: [usersTable.id],
	}),
}));
