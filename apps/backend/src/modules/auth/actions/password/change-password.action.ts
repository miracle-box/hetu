import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionService } from '~backend/services/auth/session';
import { UsersRepository } from '~backend/users/users.repository';
import { SessionScope } from '../../auth.entities';
import { changePasswordUsecase } from '../../usecases/password/change-password.usecase';
import { UserNotFoundError } from '../../user.errors';

type Command = {
	userId: string;
	oldPassword: string;
	newPassword: string;
};

export async function changePasswordAction(cmd: Command) {
	// [FIXME] Waiting for new user service and repository.
	const user = await UsersRepository.findById(cmd.userId);
	if (!user) {
		return Left(new UserNotFoundError(cmd.userId));
	}

	return EitherAsync.fromPromise(() =>
		changePasswordUsecase({
			userId: cmd.userId,
			oldPassword: cmd.oldPassword,
			newPassword: cmd.newPassword,
		}),
	)
		.chain(async () => {
			// [FIXME] Waiting for new session service and repository.
			await SessionService.revokeAll(cmd.userId);

			// Create session
			const session = await SessionService.create(cmd.userId, {
				scope: SessionScope.DEFAULT,
			});

			return Right({ session });
		})
		.map((result) => ({ session: result.session }))
		.run();
}
