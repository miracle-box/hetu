import type { DatabaseError } from '#common/errors/base.error';
import type { MinecraftClaim, SkinTextureVariant } from '#modules/users/mc-claims.entities';
import { Either } from 'purify-ts';

export type IMcClaimsRepository = {
	/**
	 * Find MC claim by ID.
	 *
	 * @param id MC claim ID
	 * @returns Either error or MC claim (null if not found)
	 */
	findMcClaimById: (id: string) => Promise<Either<DatabaseError, MinecraftClaim | null>>;

	/**
	 * Find MC claim by Minecraft UUID.
	 *
	 * @param mcUuid Minecraft UUID
	 * @returns Either error or MC claim (null if not found)
	 */
	findMcClaimByMcUuid: (mcUuid: string) => Promise<Either<DatabaseError, MinecraftClaim | null>>;

	/**
	 * Find all MC claims by user ID.
	 *
	 * @param userId User ID
	 * @returns Either error or MC claims array
	 */
	findMcClaimsByUserId: (userId: string) => Promise<Either<DatabaseError, MinecraftClaim[]>>;

	/**
	 * Create a new MC claim.
	 *
	 * @param params MC claim creation parameters
	 * @returns Either error or created MC claim
	 */
	createMcClaim: (params: {
		userId: string;
		mcUuid: string;
		mcUsername: string;
		skinTextureUrl?: string;
		skinTextureVariant?: SkinTextureVariant;
		capeTextureUrl?: string;
		capeTextureAlias?: string;
		boundProfileId?: string;
	}) => Promise<Either<DatabaseError, MinecraftClaim>>;

	/**
	 * Update MC claim by ID.
	 *
	 * @param id MC claim ID
	 * @param params Parameters to update
	 * @returns Either error or updated MC claim
	 */
	updateMcClaim: (
		id: string,
		params: Partial<{
			mcUsername: string;
			skinTextureUrl: string | null;
			skinTextureVariant: SkinTextureVariant | null;
			capeTextureUrl: string | null;
			capeTextureAlias: string | null;
			boundProfileId: string | null;
		}>,
	) => Promise<Either<DatabaseError, MinecraftClaim>>;

	/**
	 * Delete MC claim by ID.
	 *
	 * @param id MC claim ID
	 * @returns Either error or void
	 */
	deleteMcClaim: (id: string) => Promise<Either<DatabaseError, void>>;
};
