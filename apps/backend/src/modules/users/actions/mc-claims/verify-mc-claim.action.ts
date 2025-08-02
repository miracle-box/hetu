import { EitherAsync, Left, Right } from 'purify-ts';
import { ForbiddenError } from '#common/errors/base.error';
import { VerificationScenario } from '#modules/auth/auth.entities';
import { InvalidVerificationError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { createMcClaimUsecase } from '#modules/users/usecases/create-mc-claim';
import { getPrivateMcProfileUsecase } from '#modules/users/usecases/get-privete-mc-profile';
import { UserNotFoundError } from '#modules/users/users.errors';
import { UsersRepository } from '#modules/users/users.repository';

type Command = {
	userId: string;
	requestingUserId: string;
	verificationId: string;
};

export async function verifyMcClaimAction(cmd: Command) {
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
			return EitherAsync.fromPromise(() =>
				AuthRepository.findVerifiedVerification(
					cmd.verificationId,
					VerificationScenario.MC_CLAIM_VERIFICATION,
				),
			).chain(async (verification) => {
				if (!verification) {
					return Left(new InvalidVerificationError());
				}

				await AuthRepository.revokeVerificationById(verification.id);

				return Right({ user, verification });
			});
		})
		.chain(async ({ user, verification }) => {
			// Use the MSA access token from verification to authenticate with Minecraft API
			return EitherAsync.fromPromise(() =>
				getPrivateMcProfileUsecase({ msaAccessToken: verification.secret }),
			).chain(async (mcProfile) => {
				return Right({ user, verification, mcProfile });
			});
		})
		.chain(async ({ user, mcProfile }) => {
			// Create or update the MC claim using the profile
			return EitherAsync.fromPromise(() =>
				createMcClaimUsecase({ mcProfile, userId: user.id }),
			);
		})
		.run();
}
