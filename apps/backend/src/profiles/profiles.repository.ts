import { and, eq } from 'drizzle-orm';
import { db } from '~/shared/db';
import { profilesTable } from '~/shared/db/schema/profiles';
import { lower } from '~/shared/db/utils';
import { createSelectSchema } from 'drizzle-typebox';
import { Static } from 'elysia';

const profileRecordSchema = createSelectSchema(profilesTable);

type ProfileRecord = Static<typeof profileRecordSchema>;

export abstract class ProfilesRepository {
	static async findByUser(userId: string): Promise<ProfileRecord[]> {
		return db.query.profilesTable.findMany({
			where: eq(profilesTable.authorId, userId),
		});
	}

	static async findPrimaryByUser(userId: string): Promise<ProfileRecord | null> {
		const profile = await db.query.profilesTable.findFirst({
			where: and(eq(profilesTable.authorId, userId), eq(profilesTable.isPrimary, true)),
		});

		return profile ?? null;
	}

	static async findById(id: string): Promise<ProfileRecord | null> {
		const profile = await db.query.profilesTable.findFirst({
			where: eq(profilesTable.id, id),
		});

		return profile ?? null;
	}

	static async findByName(name: string): Promise<ProfileRecord | null> {
		const profile = await db.query.profilesTable.findFirst({
			where: eq(lower(profilesTable.name), name.toLowerCase()),
		});

		return profile ?? null;
	}

	/**
	 * Create a new profile.
	 *
	 * **You should check for name and primary profile existence before creating profiles.**
	 *
	 * @param params User creation parameters
	 */
	static async create(params: {
		authorId: string;
		name: string;
		isPrimary: boolean;
	}): Promise<ProfileRecord> {
		const [profile] = await db
			.insert(profilesTable)
			.values({
				authorId: params.authorId,
				name: params.name,
				isPrimary: params.isPrimary,
			})
			.returning();

		if (!profile) throw new Error('Failed to create profile');
		return profile;
	}

	static async update(
		id: string,
		params: {
			name?: string;
			skinTextureId?: string;
			capeTextureId?: string;
		},
	): Promise<ProfileRecord> {
		const [profile] = await db
			.update(profilesTable)
			.set(params)
			.where(eq(profilesTable.id, id))
			.returning();

		if (!profile) throw new Error('Failed to update profile');
		return profile;
	}
}
