import { createInsertSchema } from 'drizzle-typebox';
import Elysia, { Static, t } from 'elysia';
import { profileTable } from '~/db/schema/profile';
import { profileSchema } from '~/models/profile';

const insertSchema = createInsertSchema(profileTable);

export const getRequestSchema = t.Union(
	[
		// By user id
		t.Object({ user: t.String() }, { additionalProperties: false }),
		// By profile id
		t.Object({ id: t.String() }, { additionalProperties: false }),
		// By profile player name
		t.Object({ name: t.String() }, { additionalProperties: false }),
	],
	// { unevaluatedProperties: false },
);

export const createRequestSchema = t.Pick(insertSchema, ['name', 'isPrimary']);

export type GetRequest = Static<typeof getRequestSchema>;
export type CreateRequest = Static<typeof createRequestSchema>;

export const ProfilesModel = new Elysia({ name: 'Model.Profiles' }).model({
	'profiles.create.body': createRequestSchema,
	'profiles.create.response': profileSchema,
	'profiles.get.query': getRequestSchema,
	'profiles.get.response': t.Array(profileSchema),
});
