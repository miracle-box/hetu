import type { Profile } from '#modules/profiles/profiles.entities';
import { EitherAsync, Left, Right } from 'purify-ts';
import { ForbiddenError } from '#common/errors/base.error';
import { ProfileNotFoundError } from '#modules/profiles/profiles.errors';
import { ProfilesRepository } from '#modules/profiles/profiles.repository';
import { McClaimsRepository } from '#modules/users/mc-claims.repository';
import { McClaimNotFoundError, UserNotFoundError } from '#modules/users/users.errors';
import { UsersRepository } from '#modules/users/users.repository';

type Command = {
	userId: string;
	requestingUserId: string;
	mcClaimId: string;
	boundProfileId?: string | null;
};

export async function modifyMcClaimAction(cmd: Command) {
	// Check if user is updating their own claim
	if (cmd.requestingUserId !== cmd.userId) {
		return Left(new ForbiddenError());
	}

	return EitherAsync.fromPromise(() => UsersRepository.findUserById(cmd.userId))
		.chain(async (user) => {
			if (!user) {
				return Left(new UserNotFoundError(cmd.userId));
			}

			return Right(user);
		})
		.chain(async (user) => {
			return (await McClaimsRepository.findMcClaimById(cmd.mcClaimId)).chain((mcClaim) => {
				if (!mcClaim) {
					return Left(new McClaimNotFoundError(cmd.mcClaimId));
				}

				return Right({ user, mcClaim });
			});
		})
		.chain(async ({ user, mcClaim }) => {
			if (!cmd.boundProfileId) {
				return Right({ user, mcClaim, profile: null as Profile | null });
			}

			return (await ProfilesRepository.findProfileById(cmd.boundProfileId)).chain(
				(profile) => {
					if (!profile) {
						return Left(new ProfileNotFoundError(cmd.boundProfileId!));
					}

					return Right({ user, mcClaim, profile });
				},
			);
		})
		.chain(async ({ mcClaim, profile }) => {
			if (!profile) {
				return Right(mcClaim);
			}

			// Only `boundProfileId` is allowed to be updated for now.
			return await McClaimsRepository.updateMcClaim(mcClaim.id, {
				boundProfileId: profile.id,
			});
		})
		.run();
}
