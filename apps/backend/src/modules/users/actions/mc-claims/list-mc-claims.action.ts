import { EitherAsync, Left, Right } from 'purify-ts';
import { ForbiddenError } from '#common/errors/base.error';
import { McClaimsRepository } from '#modules/users/mc-claims.repository';
import { UserNotFoundError } from '#modules/users/users.errors';
import { UsersRepository } from '#modules/users/users.repository';

type Command = {
	userId: string;
	requestingUserId: string;
};

export async function listMcClaimsAction(cmd: Command) {
	// Check if user is requesting their own MC claims
	if (cmd.requestingUserId !== cmd.userId) {
		return Left(new ForbiddenError());
	}

	// Verify user exists
	return EitherAsync.fromPromise(() => UsersRepository.findUserById(cmd.userId))
		.chain(async (user) => {
			if (!user) {
				return Left(new UserNotFoundError(cmd.userId));
			}

			return Right(user);
		})
		.chain(async (user) => {
			// Fetch MC claims for the user
			return await McClaimsRepository.findMcClaimsByUserId(user.id);
		})
		.run();
}
