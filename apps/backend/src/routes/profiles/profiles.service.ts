import { eq } from 'drizzle-orm';
import { db } from '~/db/connection';
import { userTable } from '~/db/schema/auth';
import { profileTable } from '~/db/schema/profile';
import { Profile } from '~/models/profile';

export abstract class ProfilesService {
	static async getProfilesByUser(userId: string): Promise<Profile[]> {
		const [user] = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);

		// [TODO] put all errors in one place
		if (!user) throw new Error('User not found');

		const profiles = await db
			.select()
			.from(profileTable)
			.where(eq(profileTable.authorId, userId));

		return profiles;
	}

	static async getProfileById(id: string): Promise<Profile | null> {
		// Should be unique by design
		const [profile] = await db
			.select()
			.from(profileTable)
			.where(eq(profileTable.id, id))
			.limit(1);

		return profile ?? null;
	}

	static async getProfileByName(name: string): Promise<Profile | null> {
		// Should be unique by design (at least for now)
		const [profile] = await db
			.select()
			.from(profileTable)
			.where(eq(profileTable.name, name))
			.limit(1);

		return profile ?? null;
	}
}
