import { relations } from 'drizzle-orm';
import { profilesTable } from '#db/schema/profiles';
import { sessionsTable } from '#db/schema/sessions';
import { texturesTable } from '#db/schema/textures';
import { userAuthTable } from '#db/schema/user-auth';
import { usersTable } from '#db/schema/users';
import { verificationsTable } from '#db/schema/verifications';

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

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [sessionsTable.userId],
		references: [usersTable.id],
	}),
}));

export const texturesRelations = relations(texturesTable, ({ one }) => ({
	author: one(usersTable, {
		fields: [texturesTable.authorId],
		references: [usersTable.id],
	}),
}));

export const userAuthRelations = relations(userAuthTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [userAuthTable.userId],
		references: [usersTable.id],
	}),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
	profiles: many(profilesTable),
	authMethods: many(userAuthTable),
	verifications: many(verificationsTable),
	sessions: many(sessionsTable),
}));

export const verificationsRelations = relations(verificationsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [verificationsTable.userId],
		references: [usersTable.id],
	}),
}));
