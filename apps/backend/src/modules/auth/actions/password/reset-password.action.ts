import { EitherAsync, Left, Right } from 'purify-ts';
import { VerificationScenario } from '#modules/auth/auth.entities';
import { InvalidVerificationError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { resetPasswordUsecase } from '#modules/auth/usecases/password/reset-password.usecase';
import { UserNotFoundError } from '#modules/users/users.errors';
import { UsersRepository } from '#modules/users/users.repository';

type Command = {
	verificationId: string;
	newPassword: string;
};

export async function resetPasswordAction(cmd: Command) {
	return EitherAsync.fromPromise(() =>
		AuthRepository.findVerifiedVerification(
			cmd.verificationId,
			VerificationScenario.PASSWORD_RESET,
		),
	)
		.chain(async (verification) => {
			if (!verification || !verification.userId) {
				return Left(new InvalidVerificationError());
			}

			const userId = verification.userId;
			await AuthRepository.revokeVerificationById(cmd.verificationId);
			return Right(userId);
		})
		.chain(async (userId) => {
			const userResult = await UsersRepository.findUserById(userId);
			return userResult
				.mapLeft(() => new UserNotFoundError(userId))
				.map((user) => {
					if (!user) {
						throw new UserNotFoundError(userId);
					}
					return user;
				});
		})
		.chain(async (user) => {
			return await resetPasswordUsecase({
				userId: user.id,
				newPassword: cmd.newPassword,
			});
		})
		.run();
}
