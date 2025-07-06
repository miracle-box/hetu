import type { Texture, TextureType } from './textures.entities';
import type { DatabaseError } from '../../common/errors/base.error';
import { Either } from 'purify-ts';

export interface ITexturesRepository {
	/**
	 * Find all textures by user ID.
	 *
	 * @param userId User ID
	 * @returns Either error or array of textures
	 */
	findTexturesByUser(userId: string): Promise<Either<DatabaseError, Texture[]>>;

	/**
	 * Find texture by ID.
	 *
	 * @param id Texture ID
	 * @returns Either error or texture (null if not found)
	 */
	findTextureById(id: string): Promise<Either<DatabaseError, Texture | null>>;

	/**
	 * Find user texture by hash and type.
	 *
	 * @param userId User ID
	 * @param type Texture type
	 * @param hash Texture hash
	 * @returns Either error or texture (null if not found)
	 */
	findUserTextureByHash(
		userId: string,
		type: TextureType,
		hash: string,
	): Promise<Either<DatabaseError, Texture | null>>;

	/**
	 * Create a new texture.
	 *
	 * @param params Texture creation parameters
	 * @returns Either error or created texture
	 */
	createTexture(
		params: Pick<Texture, 'authorId' | 'name' | 'description' | 'type' | 'hash'>,
	): Promise<Either<DatabaseError, Texture>>;

	/**
	 * Update an existing texture.
	 *
	 * @param id Texture ID
	 * @param params Texture update parameters
	 * @returns Either error or updated texture
	 */
	updateTexture(
		id: string,
		params: Partial<Pick<Texture, 'name' | 'description'>>,
	): Promise<Either<DatabaseError, Texture>>;

	/**
	 * Delete texture by ID.
	 *
	 * @param id Texture ID
	 * @returns Either error or void
	 */
	deleteTexture(id: string): Promise<Either<DatabaseError, void>>;
}
