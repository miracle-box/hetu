import type { User } from './users.entities';
import type { DatabaseError } from '../../common/errors/base.error';
import type { Profile } from '../../profiles/profile.entities';
import type { Texture } from '../../textures/texture.entities';
import { Either } from 'purify-ts';

export type IUsersRepository = {
	/**
	 * Check if email or username already exists.
	 *
	 * @param email Email address
	 * @param name Username
	 * @returns Either error or boolean indicating if exists
	 */
	emailOrNameExists: (email: string, name: string) => Promise<Either<DatabaseError, boolean>>;

	/**
	 * Find user by email.
	 *
	 * @param email Email address
	 * @returns Either error or user (null if not found)
	 */
	findUserByEmail: (email: string) => Promise<Either<DatabaseError, User | null>>;

	/**
	 * Find user by ID.
	 *
	 * @param id User ID
	 * @returns Either error or user (null if not found)
	 */
	findUserById: (id: string) => Promise<Either<DatabaseError, User | null>>;

	/**
	 * Find user by username.
	 *
	 * @param name Username
	 * @returns Either error or user (null if not found)
	 */
	findUserByName: (name: string) => Promise<Either<DatabaseError, User | null>>;

	/**
	 * Create a new user.
	 *
	 * @param params User creation parameters
	 * @returns Either error or created user
	 */
	createUser: (params: { name: string; email: string }) => Promise<Either<DatabaseError, User>>;

	/**
	 * Update user by ID.
	 *
	 * @param id User ID
	 * @param params Parameters to update
	 * @returns Either error or updated user
	 */
	updateUser: (
		id: string,
		params: Partial<Pick<User, 'name' | 'email'>>,
	) => Promise<Either<DatabaseError, User>>;

	/**
	 * Delete user by ID.
	 *
	 * @param id User ID
	 * @returns Either error or void
	 */
	deleteUser: (id: string) => Promise<Either<DatabaseError, void>>;

	// [TODO] Below is probably not good to be here.

	/**
	 * Find user profiles by user ID.
	 *
	 * @param userId User ID
	 * @returns Either error or user profiles array
	 */
	findProfilesByUser: (userId: string) => Promise<Either<DatabaseError, Profile[]>>;

	/**
	 * Find user profile by ID.
	 *
	 * @param id Profile ID
	 * @returns Either error or user profile (null if not found)
	 */
	findProfileById: (id: string) => Promise<Either<DatabaseError, Profile | null>>;

	/**
	 * Create a new user profile.
	 *
	 * @param params Profile creation parameters
	 * @returns Either error or created profile
	 */
	createProfile: (params: {
		userId: string;
		name: string;
		skinTextureId?: string;
		capeTextureId?: string;
		isPrimary: boolean;
	}) => Promise<Either<DatabaseError, Profile>>;

	/**
	 * Update user profile by ID.
	 *
	 * @param id Profile ID
	 * @param params Parameters to update
	 * @returns Either error or updated profile
	 */
	updateProfile: (
		id: string,
		params: Partial<Pick<Profile, 'name' | 'skinTextureId' | 'capeTextureId' | 'isPrimary'>>,
	) => Promise<Either<DatabaseError, Profile>>;

	/**
	 * Delete user profile by ID.
	 *
	 * @param id Profile ID
	 * @returns Either error or void
	 */
	deleteProfile: (id: string) => Promise<Either<DatabaseError, void>>;

	/**
	 * Find user textures by user ID.
	 *
	 * @param userId User ID
	 * @returns Either error or user textures array
	 */
	findTexturesByUser: (userId: string) => Promise<Either<DatabaseError, Texture[]>>;

	/**
	 * Find user texture by ID.
	 *
	 * @param id Texture ID
	 * @returns Either error or user texture (null if not found)
	 */
	findTextureById: (id: string) => Promise<Either<DatabaseError, Texture | null>>;

	/**
	 * Create a new user texture.
	 *
	 * @param params Texture creation parameters
	 * @returns Either error or created texture
	 */
	createTexture: (params: {
		userId: string;
		type: Texture['type'];
		name: string;
		description: string;
		hash: string;
	}) => Promise<Either<DatabaseError, Texture>>;

	/**
	 * Update user texture by ID.
	 *
	 * @param id Texture ID
	 * @param params Parameters to update
	 * @returns Either error or updated texture
	 */
	updateTexture: (
		id: string,
		params: Partial<Pick<Texture, 'name' | 'description' | 'hash'>>,
	) => Promise<Either<DatabaseError, Texture>>;

	/**
	 * Delete user texture by ID.
	 *
	 * @param id Texture ID
	 * @returns Either error or void
	 */
	deleteTexture: (id: string) => Promise<Either<DatabaseError, void>>;
};
