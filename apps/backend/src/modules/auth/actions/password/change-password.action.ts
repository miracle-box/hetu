import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionScope } from '#modules/auth/auth.entities';
import { AuthRepository } from '#modules/auth/auth.repository';
import { changePasswordUsecase } from '#modules/auth/usecases/password/change-password.usecase';
import { UserNotFoundError } from '#modules/users/users.errors';
import { UsersRepository } from '#modules/users/users.repository';

type Command = {
	userId: string;
	oldPassword: string;
	newPassword: string;
};

export async function changePasswordAction(cmd: Command) {
	return EitherAsync.fromPromise(() => UsersRepository.findUserById(cmd.userId))
		.mapLeft(() => new UserNotFoundError(cmd.userId))
		.chain(async (user) => {
			if (!user) {
				return Left(new UserNotFoundError(cmd.userId));
			}
			return Right(user);
		})
		.chain(async (user) => {
			return changePasswordUsecase({
				userId: user.id,
				oldPassword: cmd.oldPassword,
				newPassword: cmd.newPassword,
			});
		})
		.chain(async () => {
			await AuthRepository.revokeSessionsByUser(cmd.userId);

			// Create session
			return await AuthRepository.createSession({
				userId: cmd.userId,
				metadata: {
					scope: SessionScope.DEFAULT,
				},
			});
		})
		.map((session) => ({ session }))
		.run();
}
