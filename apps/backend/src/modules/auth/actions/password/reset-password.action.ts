import { EitherAsync, Left, Right } from 'purify-ts';
import { UserNotFoundError } from '../../../users/users.errors';
import { UsersRepository } from '../../../users/users.repository';
import { VerificationScenario } from '../../auth.entities';
import { InvalidVerificationError } from '../../auth.errors';
import { AuthRepository } from '../../auth.repository';
import { resetPasswordUsecase } from '../../usecases/password/reset-password.usecase';

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
