import type { Profile } from './profiles.entities';
import type { IProfilesRepository } from './profiles.repository.interface';
import { and, eq } from 'drizzle-orm';
import { Either, Left, Right } from 'purify-ts';
import { useDatabase } from '~backend/shared/db';
import { profilesTable } from '~backend/shared/db/schema/profiles';
import { lower } from '~backend/shared/db/sql';
import { DatabaseError } from '../../common/errors/base.error';

export const ProfilesRepository: IProfilesRepository = {
	async findProfilesByUser(userId: string): Promise<Either<DatabaseError, Profile[]>> {
		try {
			const db = useDatabase();

			const profiles = await db.query.profilesTable.findMany({
				where: eq(profilesTable.authorId, userId),
			});

			return Right(profiles);
		} catch (error) {
			return Left(new DatabaseError('Failed to find user profiles', error));
		}
	},

	async findPrimaryProfileByUser(userId: string): Promise<Either<DatabaseError, Profile | null>> {
		try {
			const db = useDatabase();

			const profile = await db.query.profilesTable.findFirst({
				where: and(eq(profilesTable.authorId, userId), eq(profilesTable.isPrimary, true)),
			});

			return Right(profile ?? null);
		} catch (error) {
			return Left(new DatabaseError('Failed to find primary profile', error));
		}
	},

	async findProfileById(id: string): Promise<Either<DatabaseError, Profile | null>> {
		try {
			const db = useDatabase();

			const profile = await db.query.profilesTable.findFirst({
				where: eq(profilesTable.id, id),
			});

			return Right(profile ?? null);
		} catch (error) {
			return Left(new DatabaseError('Failed to find profile by ID', error));
		}
	},

	async findProfileByName(name: string): Promise<Either<DatabaseError, Profile | null>> {
		try {
			const db = useDatabase();

			const profile = await db.query.profilesTable.findFirst({
				where: eq(lower(profilesTable.name), name.toLowerCase()),
			});

			return Right(profile ?? null);
		} catch (error) {
			return Left(new DatabaseError('Failed to find profile by name', error));
		}
	},

	async createProfile(params: {
		authorId: string;
		name: string;
		isPrimary: boolean;
	}): Promise<Either<DatabaseError, Profile>> {
		try {
			const db = useDatabase();

			const [profile] = await db
				.insert(profilesTable)
				.values({
					authorId: params.authorId,
					name: params.name,
					isPrimary: params.isPrimary,
				})
				.returning();

			if (!profile) {
				return Left(
					new DatabaseError('Failed to create profile', 'No profile record returned'),
				);
			}

			return Right(profile);
		} catch (error) {
			return Left(new DatabaseError('Failed to create profile', error));
		}
	},

	async updateProfile(
		id: string,
		params: {
			name?: string;
			skinTextureId?: string | null;
			capeTextureId?: string | null;
		},
	): Promise<Either<DatabaseError, Profile>> {
		try {
			const db = useDatabase();

			const [profile] = await db
				.update(profilesTable)
				.set(params)
				.where(eq(profilesTable.id, id))
				.returning();

			if (!profile) {
				return Left(new DatabaseError('Profile not found', 'No profile record returned'));
			}

			return Right(profile);
		} catch (error) {
			return Left(new DatabaseError('Failed to update profile', error));
		}
	},

	async deleteProfile(id: string): Promise<Either<DatabaseError, void>> {
		try {
			const db = useDatabase();

			await db.delete(profilesTable).where(eq(profilesTable.id, id));

			return Right(undefined);
		} catch (error) {
			return Left(new DatabaseError('Failed to delete profile', error));
		}
	},
};
