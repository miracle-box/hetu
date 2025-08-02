import type { MinecraftClaim, SkinTextureVariant } from '#modules/users/mc-claims.entities';
import type { IMcClaimsRepository } from '#modules/users/mc-claims.repository.interface';
import { eq } from 'drizzle-orm';
import { Either, Left, Right } from 'purify-ts';
import { DatabaseError } from '#common/errors/base.error';
import { useDatabase } from '#db';
import { mcClaimsTable } from '#db/schema/mc-claims';

export const McClaimsRepository: IMcClaimsRepository = {
	async findMcClaimById(id: string): Promise<Either<DatabaseError, MinecraftClaim | null>> {
		try {
			const db = useDatabase();

			const mcClaim = await db.query.mcClaimsTable.findFirst({
				where: eq(mcClaimsTable.id, id),
			});

			return Right(
				mcClaim
					? {
							id: mcClaim.id,
							userId: mcClaim.userId,
							mcUuid: mcClaim.mcUuid,
							mcUsername: mcClaim.mcUsername,
							skinTextureUrl: mcClaim.skinTextureUrl,
							skinTextureVariant: mcClaim.skinTextureVariant,
							capeTextureUrl: mcClaim.capeTextureUrl,
							capeTextureAlias: mcClaim.capeTextureAlias,
							boundProfileId: mcClaim.boundProfileId,
							createdAt: mcClaim.createdAt,
							updatedAt: mcClaim.updatedAt,
						}
					: null,
			);
		} catch (error) {
			return Left(new DatabaseError('Failed to find MC claim by ID', error));
		}
	},

	async findMcClaimByMcUuid(
		mcUuid: string,
	): Promise<Either<DatabaseError, MinecraftClaim | null>> {
		try {
			const db = useDatabase();

			const mcClaim = await db.query.mcClaimsTable.findFirst({
				where: eq(mcClaimsTable.mcUuid, mcUuid),
			});

			return Right(
				mcClaim
					? {
							id: mcClaim.id,
							userId: mcClaim.userId,
							mcUuid: mcClaim.mcUuid,
							mcUsername: mcClaim.mcUsername,
							skinTextureUrl: mcClaim.skinTextureUrl,
							skinTextureVariant: mcClaim.skinTextureVariant,
							capeTextureUrl: mcClaim.capeTextureUrl,
							capeTextureAlias: mcClaim.capeTextureAlias,
							boundProfileId: mcClaim.boundProfileId,
							createdAt: mcClaim.createdAt,
							updatedAt: mcClaim.updatedAt,
						}
					: null,
			);
		} catch (error) {
			return Left(new DatabaseError('Failed to find MC claim by UUID', error));
		}
	},

	async findMcClaimsByUserId(userId: string): Promise<Either<DatabaseError, MinecraftClaim[]>> {
		try {
			const db = useDatabase();

			const mcClaims = await db.query.mcClaimsTable.findMany({
				where: eq(mcClaimsTable.userId, userId),
				orderBy: (mcClaimsTable, { desc }) => [desc(mcClaimsTable.createdAt)],
			});

			return Right(
				mcClaims.map((mcClaim) => ({
					id: mcClaim.id,
					userId: mcClaim.userId,
					mcUuid: mcClaim.mcUuid,
					mcUsername: mcClaim.mcUsername,
					skinTextureUrl: mcClaim.skinTextureUrl,
					skinTextureVariant: mcClaim.skinTextureVariant,
					capeTextureUrl: mcClaim.capeTextureUrl,
					capeTextureAlias: mcClaim.capeTextureAlias,
					boundProfileId: mcClaim.boundProfileId,
					createdAt: mcClaim.createdAt,
					updatedAt: mcClaim.updatedAt,
				})),
			);
		} catch (error) {
			return Left(new DatabaseError('Failed to find MC claims by user ID', error));
		}
	},

	async createMcClaim(params: {
		userId: string;
		mcUuid: string;
		mcUsername: string;
		skinTextureUrl?: string;
		skinTextureVariant?: SkinTextureVariant;
		capeTextureUrl?: string;
		capeTextureAlias?: string;
		boundProfileId?: string;
	}): Promise<Either<DatabaseError, MinecraftClaim>> {
		try {
			const db = useDatabase();

			const [insertedMcClaim] = await db
				.insert(mcClaimsTable)
				.values({
					userId: params.userId,
					mcUuid: params.mcUuid,
					mcUsername: params.mcUsername,
					skinTextureUrl: params.skinTextureUrl || null,
					skinTextureVariant: params.skinTextureVariant || null,
					capeTextureUrl: params.capeTextureUrl || null,
					capeTextureAlias: params.capeTextureAlias || null,
					boundProfileId: params.boundProfileId || null,
				})
				.returning();

			if (!insertedMcClaim) {
				return Left(
					new DatabaseError('Failed to create MC claim', 'No MC claim record returned'),
				);
			}

			return Right({
				id: insertedMcClaim.id,
				userId: insertedMcClaim.userId,
				mcUuid: insertedMcClaim.mcUuid,
				mcUsername: insertedMcClaim.mcUsername,
				skinTextureUrl: insertedMcClaim.skinTextureUrl,
				skinTextureVariant: insertedMcClaim.skinTextureVariant,
				capeTextureUrl: insertedMcClaim.capeTextureUrl,
				capeTextureAlias: insertedMcClaim.capeTextureAlias,
				boundProfileId: insertedMcClaim.boundProfileId,
				createdAt: insertedMcClaim.createdAt,
				updatedAt: insertedMcClaim.updatedAt,
			});
		} catch (error) {
			return Left(new DatabaseError('Failed to create MC claim', error));
		}
	},

	async updateMcClaim(
		id: string,
		params: Partial<{
			mcUsername: string;
			skinTextureUrl: string | null;
			skinTextureVariant: SkinTextureVariant | null;
			capeTextureUrl: string | null;
			capeTextureAlias: string | null;
			boundProfileId: string | null;
		}>,
	): Promise<Either<DatabaseError, MinecraftClaim>> {
		try {
			const db = useDatabase();

			const [updatedMcClaim] = await db
				.update(mcClaimsTable)
				.set({
					...params,
				})
				.where(eq(mcClaimsTable.id, id))
				.returning();

			if (!updatedMcClaim) {
				return Left(
					new DatabaseError('Failed to update MC claim', 'No MC claim record returned'),
				);
			}

			return Right({
				id: updatedMcClaim.id,
				userId: updatedMcClaim.userId,
				mcUuid: updatedMcClaim.mcUuid,
				mcUsername: updatedMcClaim.mcUsername,
				skinTextureUrl: updatedMcClaim.skinTextureUrl,
				skinTextureVariant: updatedMcClaim.skinTextureVariant,
				capeTextureUrl: updatedMcClaim.capeTextureUrl,
				capeTextureAlias: updatedMcClaim.capeTextureAlias,
				boundProfileId: updatedMcClaim.boundProfileId,
				createdAt: updatedMcClaim.createdAt,
				updatedAt: updatedMcClaim.updatedAt,
			});
		} catch (error) {
			return Left(new DatabaseError('Failed to update MC claim', error));
		}
	},

	async deleteMcClaim(id: string): Promise<Either<DatabaseError, void>> {
		try {
			const db = useDatabase();

			await db.delete(mcClaimsTable).where(eq(mcClaimsTable.id, id));

			return Right(undefined);
		} catch (error) {
			return Left(new DatabaseError('Failed to delete MC claim', error));
		}
	},
};
