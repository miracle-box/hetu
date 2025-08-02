import type { MinecraftProfile } from '../services/minecraft-api';
import { EitherAsync, Left, Right } from 'purify-ts';
import { McClaimsRepository } from '../mc-claims.repository';
import { McClaimAlreadyExistsError } from '../users.errors';

export type Command = {
	mcProfile: MinecraftProfile;
	userId: string;
};

export async function createMcClaimUsecase(cmd: Command) {
	return EitherAsync.fromPromise(() => McClaimsRepository.findMcClaimByMcUuid(cmd.mcProfile.uuid))
		.chain(async (mcClaim) => {
			// Check if claim already bound by another user
			if (mcClaim && mcClaim.userId !== cmd.userId) {
				return Left(new McClaimAlreadyExistsError(cmd.mcProfile.uuid));
			}

			return Right({ profile: cmd.mcProfile, mcClaim });
		})
		.chain(async ({ profile, mcClaim }) => {
			// Update if exists, create if not
			if (mcClaim) {
				return (
					await McClaimsRepository.updateMcClaim(mcClaim.id, {
						mcUsername: profile.username,
						skinTextureUrl: profile.skin?.url,
						skinTextureVariant: profile.skin?.variant,
						capeTextureUrl: profile.cape?.url,
						capeTextureAlias: profile.cape?.alias,
					})
				).map((updatedClaim) => ({
					mcClaim: updatedClaim,
					exists: true,
				}));
			}

			return (
				await McClaimsRepository.createMcClaim({
					userId: cmd.userId,
					mcUuid: profile.uuid,
					mcUsername: profile.username,
					skinTextureUrl: profile.skin?.url,
					skinTextureVariant: profile.skin?.variant,
					capeTextureUrl: profile.cape?.url,
					capeTextureAlias: profile.cape?.alias,
				})
			).map((createdClaim) => ({
				mcClaim: createdClaim,
				exists: false,
			}));
		})
		.run();
}
