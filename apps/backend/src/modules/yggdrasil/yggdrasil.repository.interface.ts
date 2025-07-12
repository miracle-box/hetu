import type { DatabaseError } from '#common/errors/base.error';
import type { Profile } from '#modules/profiles/profiles.entities';
import type { Texture } from '#modules/textures/textures.entities';
import type { YggServerSession } from '#modules/yggdrasil/yggdrasil.entities';
import { Either } from 'purify-ts';

export interface IYggdrasilRepository {
	/**
	 * Get profiles digest by names.
	 *
	 * @param names Array of profile names
	 * @returns Either error or array of profile digests
	 */
	getProfilesDigestByNames(
		names: string[],
	): Promise<Either<DatabaseError, Pick<Profile, 'id' | 'name'>[]>>;

	/**
	 * Get profiles digest by user ID.
	 *
	 * @param userId User ID
	 * @returns Either error or array of profile digests
	 */
	getProfilesDigestByUser(
		userId: string,
	): Promise<Either<DatabaseError, Pick<Profile, 'id' | 'name'>[]>>;

	/**
	 * Get profile digest by ID.
	 *
	 * @param id Profile ID
	 * @returns Either error or profile digest (null if not found)
	 */
	getProfileDigestById(
		id: string,
	): Promise<Either<DatabaseError, Pick<Profile, 'id' | 'name'> | null>>;

	/**
	 * Get profile digest with skins by ID.
	 *
	 * @param id Profile ID
	 * @returns Either error or profile digest with skins (null if not found)
	 */
	getProfileDigestWithSkinsById(id: string): Promise<
		Either<
			DatabaseError,
			| (Pick<Profile, 'id' | 'name'> & {
					skinTexture: Pick<Texture, 'hash' | 'type'> | null;
					capeTexture: Pick<Texture, 'hash' | 'type'> | null;
			  })
			| null
		>
	>;

	/**
	 * Get profile digest with skins by name.
	 *
	 * @param name Profile name
	 * @returns Either error or profile digest with skins (null if not found)
	 */
	getProfileDigestWithSkinsByName(name: string): Promise<
		Either<
			DatabaseError,
			| (Pick<Profile, 'id' | 'name'> & {
					skinTexture: Pick<Texture, 'hash' | 'type'> | null;
					capeTexture: Pick<Texture, 'hash' | 'type'> | null;
			  })
			| null
		>
	>;

	/**
	 * Find join record by server ID.
	 *
	 * @param serverId Server ID
	 * @returns Either error or server session (null if not found)
	 */
	findJoinRecordByServerId(
		serverId: string,
	): Promise<Either<DatabaseError, YggServerSession | null>>;

	/**
	 * Create join record.
	 *
	 * @param params Join record parameters
	 * @returns Either error or void
	 */
	createJoinRecord(params: {
		serverId: string;
		accessToken: string;
		clientIp: string;
		expiresAt: Date;
	}): Promise<Either<DatabaseError, void>>;
}
