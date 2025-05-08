import { createId } from '@paralleldrive/cuid2';
import { boolean, smallint, pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const verificationTypeEnum = pgEnum('verification_type', ['email', 'oauth2']);
export const verificationScenarioEnum = pgEnum('verification_scenario', [
	'signup',
	'password_reset',
	'oauth2_bind',
	'oauth2_signin',
]);

export const verificationsTable = pgTable('verifications', {
	id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
	userId: varchar('user_id', { length: 24 }),
	type: verificationTypeEnum('type').notNull(),
	scenario: verificationScenarioEnum('scenario').notNull(),
	target: varchar('target').notNull(),
	secret: varchar('secret').notNull(),
	verified: boolean('verified').notNull(),
	triesLeft: smallint('tries_left').notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
