import { EitherAsync, Left, Right } from 'purify-ts';
import { ForbiddenError } from '#common/errors/base.error';
import { McClaimsRepository } from '#modules/users/mc-claims.repository';
import { McClaimNotFoundError, UserNotFoundError } from '#modules/users/users.errors';
import { UsersRepository } from '#modules/users/users.repository';

type Command = {
	userId: string;
	requestingUserId: string;
	mcClaimId: string;
};

export async function removeMcClaimAction(cmd: Command) {
	// Check if user is deleting their own claim
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
			return (await McClaimsRepository.findMcClaimById(cmd.mcClaimId))
				.chain((mcClaim) => {
					if (!mcClaim) {
						return Left(new McClaimNotFoundError(cmd.mcClaimId));
					}

					return Right({ user, mcClaim });
				})
				.chain(({ mcClaim }) => {
					// Validate ownership
					if (mcClaim.userId !== cmd.userId) {
						return Left(new ForbiddenError());
					}

					return Right(mcClaim);
				});
		})
		.chain(async (mcClaim) => {
			// Delete the claim
			return await McClaimsRepository.deleteMcClaim(mcClaim.id);
		})
		.run();
}
