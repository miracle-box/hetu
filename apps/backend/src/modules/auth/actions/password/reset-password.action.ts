import { EitherAsync, Left, Right } from 'purify-ts';
import { UsersRepository } from '~backend/users/users.repository';
import { VerificationScenario } from '../../auth.entities';
import { InvalidVerificationError } from '../../auth.errors';
import { AuthRepository } from '../../auth.repository';
import { resetPasswordUsecase } from '../../usecases/password/reset-password.usecase';
import { UserNotFoundError } from '../../user.errors';

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
			const user = await UsersRepository.findById(userId);
			if (!user) {
				return Left(new UserNotFoundError(userId));
			}

			return Right(user);
		})
		.chain(async (user) => {
			return await resetPasswordUsecase({
				userId: user.id,
				newPassword: cmd.newPassword,
			});
		})
		.run();
}
