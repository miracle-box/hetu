import type { User } from './users.entities';
import type { IUsersRepository } from './users.repository.interface';
import type { Profile } from '../profiles/profiles.entities';
import type { Texture } from '../textures/textures.entities';
import { eq, or } from 'drizzle-orm';
import { Either, Left, Right } from 'purify-ts';
import { DatabaseError } from '../../common/errors/base.error';
import { useDatabase } from '../../shared/db';
import { profilesTable } from '../../shared/db/schema/profiles';
import { texturesTable } from '../../shared/db/schema/textures';
import { usersTable } from '../../shared/db/schema/users';

export const UsersRepository: IUsersRepository = {
	async emailOrNameExists(email: string, name: string): Promise<Either<DatabaseError, boolean>> {
		try {
			const db = useDatabase();

			const existingUser = await db.query.usersTable.findFirst({
				columns: {
					id: true,
				},
				where: or(eq(usersTable.email, email), eq(usersTable.name, name)),
			});

			return Right(!!existingUser);
		} catch (error) {
			return Left(new DatabaseError('Failed to check email or name existence', error));
		}
	},

	async findUserByEmail(email: string): Promise<Either<DatabaseError, User | null>> {
		try {
			const db = useDatabase();

			const user = await db.query.usersTable.findFirst({
				where: eq(usersTable.email, email),
			});

			return Right(
				user
					? {
							id: user.id,
							name: user.name,
							email: user.email,
							createdAt: user.createdAt,
							updatedAt: user.updatedAt,
						}
					: null,
			);
		} catch (error) {
			return Left(new DatabaseError('Failed to find user by email', error));
		}
	},

	async findUserById(id: string): Promise<Either<DatabaseError, User | null>> {
		try {
			const db = useDatabase();

			const user = await db.query.usersTable.findFirst({
				where: eq(usersTable.id, id),
			});

			return Right(
				user
					? {
							id: user.id,
							name: user.name,
							email: user.email,
							createdAt: user.createdAt,
							updatedAt: user.updatedAt,
						}
					: null,
			);
		} catch (error) {
			return Left(new DatabaseError('Failed to find user by ID', error));
		}
	},

	async findUserByName(name: string): Promise<Either<DatabaseError, User | null>> {
		try {
			const db = useDatabase();

			const user = await db.query.usersTable.findFirst({
				where: eq(usersTable.name, name),
			});

			return Right(
				user
					? {
							id: user.id,
							name: user.name,
							email: user.email,
							createdAt: user.createdAt,
							updatedAt: user.updatedAt,
						}
					: null,
			);
		} catch (error) {
			return Left(new DatabaseError('Failed to find user by name', error));
		}
	},

	async createUser(params: {
		name: string;
		email: string;
	}): Promise<Either<DatabaseError, User>> {
		try {
			const db = useDatabase();

			const [insertedUser] = await db
				.insert(usersTable)
				.values({
					name: params.name,
					email: params.email,
				})
				.returning();

			if (!insertedUser) {
				return Left(new DatabaseError('Failed to create user', 'No user record returned'));
			}

			return Right({
				id: insertedUser.id,
				name: insertedUser.name,
				email: insertedUser.email,
				createdAt: insertedUser.createdAt,
				updatedAt: insertedUser.updatedAt,
			});
		} catch (error) {
			return Left(new DatabaseError('Failed to create user', error));
		}
	},

	async updateUser(
		id: string,
		params: Partial<Pick<User, 'name' | 'email'>>,
	): Promise<Either<DatabaseError, User>> {
		try {
			const db = useDatabase();

			const [updatedUser] = await db
				.update(usersTable)
				.set({
					...params,
					updatedAt: new Date(),
				})
				.where(eq(usersTable.id, id))
				.returning();

			if (!updatedUser) {
				return Left(new DatabaseError('User not found', 'No user record returned'));
			}

			return Right({
				id: updatedUser.id,
				name: updatedUser.name,
				email: updatedUser.email,
				createdAt: updatedUser.createdAt,
				updatedAt: updatedUser.updatedAt,
			});
		} catch (error) {
			return Left(new DatabaseError('Failed to update user', error));
		}
	},

	async deleteUser(id: string): Promise<Either<DatabaseError, void>> {
		try {
			const db = useDatabase();

			await db.delete(usersTable).where(eq(usersTable.id, id));

			return Right(undefined);
		} catch (error) {
			return Left(new DatabaseError('Failed to delete user', error));
		}
	},

	async findProfilesByUser(userId: string): Promise<Either<DatabaseError, Profile[]>> {
		try {
			const db = useDatabase();

			const profiles = await db.query.profilesTable.findMany({
				where: eq(profilesTable.authorId, userId),
			});

			return Right(
				profiles.map((profile) => ({
					id: profile.id,
					authorId: profile.authorId,
					name: profile.name,
					skinTextureId: profile.skinTextureId,
					capeTextureId: profile.capeTextureId,
					isPrimary: profile.isPrimary,
				})),
			);
		} catch (error) {
			return Left(new DatabaseError('Failed to find user profiles', error));
		}
	},

	async findProfileById(id: string): Promise<Either<DatabaseError, Profile | null>> {
		try {
			const db = useDatabase();

			const profile = await db.query.profilesTable.findFirst({
				where: eq(profilesTable.id, id),
			});

			return Right(
				profile
					? {
							id: profile.id,
							authorId: profile.authorId,
							name: profile.name,
							skinTextureId: profile.skinTextureId,
							capeTextureId: profile.capeTextureId,
							isPrimary: profile.isPrimary,
						}
					: null,
			);
		} catch (error) {
			return Left(new DatabaseError('Failed to find user profile', error));
		}
	},

	async createProfile(params: {
		userId: string;
		name: string;
		skinTextureId?: string;
		capeTextureId?: string;
		isPrimary: boolean;
	}): Promise<Either<DatabaseError, Profile>> {
		try {
			const db = useDatabase();

			const [insertedProfile] = await db
				.insert(profilesTable)
				.values({
					authorId: params.userId,
					name: params.name,
					skinTextureId: params.skinTextureId,
					capeTextureId: params.capeTextureId,
					isPrimary: params.isPrimary,
				})
				.returning();

			if (!insertedProfile) {
				return Left(
					new DatabaseError(
						'Failed to create user profile',
						'No profile record returned',
					),
				);
			}

			return Right({
				id: insertedProfile.id,
				authorId: insertedProfile.authorId,
				name: insertedProfile.name,
				skinTextureId: insertedProfile.skinTextureId,
				capeTextureId: insertedProfile.capeTextureId,
				isPrimary: insertedProfile.isPrimary,
			});
		} catch (error) {
			return Left(new DatabaseError('Failed to create user profile', error));
		}
	},

	async updateProfile(
		id: string,
		params: Partial<Pick<Profile, 'name' | 'skinTextureId' | 'capeTextureId' | 'isPrimary'>>,
	): Promise<Either<DatabaseError, Profile>> {
		try {
			const db = useDatabase();

			const [updatedProfile] = await db
				.update(profilesTable)
				.set({
					name: params.name,
					skinTextureId: params.skinTextureId,
					capeTextureId: params.capeTextureId,
					isPrimary: params.isPrimary,
					updatedAt: new Date(),
				})
				.where(eq(profilesTable.id, id))
				.returning();

			if (!updatedProfile) {
				return Left(
					new DatabaseError('User profile not found', 'No profile record returned'),
				);
			}

			return Right({
				id: updatedProfile.id,
				authorId: updatedProfile.authorId,
				name: updatedProfile.name,
				skinTextureId: updatedProfile.skinTextureId,
				capeTextureId: updatedProfile.capeTextureId,
				isPrimary: updatedProfile.isPrimary,
			});
		} catch (error) {
			return Left(new DatabaseError('Failed to update user profile', error));
		}
	},

	async deleteProfile(id: string): Promise<Either<DatabaseError, void>> {
		try {
			const db = useDatabase();

			await db.delete(profilesTable).where(eq(profilesTable.id, id));

			return Right(undefined);
		} catch (error) {
			return Left(new DatabaseError('Failed to delete user profile', error));
		}
	},

	async findTexturesByUser(userId: string): Promise<Either<DatabaseError, Texture[]>> {
		try {
			const db = useDatabase();

			const textures = await db.query.texturesTable.findMany({
				where: eq(texturesTable.authorId, userId),
			});

			return Right(
				textures.map((texture) => ({
					id: texture.id,
					authorId: texture.authorId,
					name: texture.name,
					description: texture.description,
					type: texture.type,
					hash: texture.hash,
				})),
			);
		} catch (error) {
			return Left(new DatabaseError('Failed to find user textures', error));
		}
	},

	async findTextureById(id: string): Promise<Either<DatabaseError, Texture | null>> {
		try {
			const db = useDatabase();

			const texture = await db.query.texturesTable.findFirst({
				where: eq(texturesTable.id, id),
			});

			return Right(
				texture
					? {
							id: texture.id,
							authorId: texture.authorId,
							name: texture.name,
							description: texture.description,
							type: texture.type,
							hash: texture.hash,
						}
					: null,
			);
		} catch (error) {
			return Left(new DatabaseError('Failed to find user texture', error));
		}
	},

	async createTexture(params: {
		userId: string;
		type: Texture['type'];
		name: string;
		description: string;
		hash: string;
	}): Promise<Either<DatabaseError, Texture>> {
		try {
			const db = useDatabase();

			const [insertedTexture] = await db
				.insert(texturesTable)
				.values({
					authorId: params.userId,
					name: params.name,
					description: params.description,
					type: params.type,
					hash: params.hash,
				})
				.returning();

			if (!insertedTexture) {
				return Left(
					new DatabaseError(
						'Failed to create user texture',
						'No texture record returned',
					),
				);
			}

			return Right({
				id: insertedTexture.id,
				authorId: insertedTexture.authorId,
				name: insertedTexture.name,
				description: insertedTexture.description,
				type: insertedTexture.type,
				hash: insertedTexture.hash,
			});
		} catch (error) {
			return Left(new DatabaseError('Failed to create user texture', error));
		}
	},

	async updateTexture(
		id: string,
		params: Partial<Pick<Texture, 'name' | 'description' | 'hash'>>,
	): Promise<Either<DatabaseError, Texture>> {
		try {
			const db = useDatabase();

			const [updatedTexture] = await db
				.update(texturesTable)
				.set({
					name: params.name,
					description: params.description,
					hash: params.hash,
					updatedAt: new Date(),
				})
				.where(eq(texturesTable.id, id))
				.returning();

			if (!updatedTexture) {
				return Left(
					new DatabaseError('User texture not found', 'No texture record returned'),
				);
			}

			return Right({
				id: updatedTexture.id,
				authorId: updatedTexture.authorId,
				name: updatedTexture.name,
				description: updatedTexture.description,
				type: updatedTexture.type,
				hash: updatedTexture.hash,
			});
		} catch (error) {
			return Left(new DatabaseError('Failed to update user texture', error));
		}
	},

	async deleteTexture(id: string): Promise<Either<DatabaseError, void>> {
		try {
			const db = useDatabase();

			await db.delete(texturesTable).where(eq(texturesTable.id, id));

			return Right(undefined);
		} catch (error) {
			return Left(new DatabaseError('Failed to delete user texture', error));
		}
	},
};
