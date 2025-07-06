import type { Profile } from './profiles.entities';
import type { DatabaseError } from '../../common/errors/base.error';
import { Either } from 'purify-ts';

export interface IProfilesRepository {
	/**
	 * Find all profiles by user ID.
	 *
	 * @param userId User ID
	 * @returns Either error or array of profiles
	 */
	findProfilesByUser(userId: string): Promise<Either<DatabaseError, Profile[]>>;

	/**
	 * Find primary profile by user ID.
	 *
	 * @param userId User ID
	 * @returns Either error or primary profile (null if not found)
	 */
	findPrimaryProfileByUser(userId: string): Promise<Either<DatabaseError, Profile | null>>;

	/**
	 * Find profile by ID.
	 *
	 * @param id Profile ID
	 * @returns Either error or profile (null if not found)
	 */
	findProfileById(id: string): Promise<Either<DatabaseError, Profile | null>>;

	/**
	 * Find profile by name.
	 *
	 * @param name Profile name
	 * @returns Either error or profile (null if not found)
	 */
	findProfileByName(name: string): Promise<Either<DatabaseError, Profile | null>>;

	/**
	 * Create a new profile.
	 *
	 * @param params Profile creation parameters
	 * @returns Either error or created profile
	 */
	createProfile(params: {
		authorId: string;
		name: string;
		isPrimary: boolean;
	}): Promise<Either<DatabaseError, Profile>>;

	/**
	 * Update profile by ID.
	 *
	 * @param id Profile ID
	 * @param params Update parameters
	 * @returns Either error or updated profile
	 */
	updateProfile(
		id: string,
		params: {
			name?: string;
			skinTextureId?: string | null;
			capeTextureId?: string | null;
		},
	): Promise<Either<DatabaseError, Profile>>;

	/**
	 * Delete profile by ID.
	 *
	 * @param id Profile ID
	 * @returns Either error or void
	 */
	deleteProfile(id: string): Promise<Either<DatabaseError, void>>;
}
