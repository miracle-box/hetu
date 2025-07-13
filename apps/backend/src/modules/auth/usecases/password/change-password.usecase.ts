import { EitherAsync, Left, Right } from 'purify-ts';
import { InvalidCredentialsError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { PasswordHashService } from '#modules/auth/services/password-hash.service';

type Command = {
	userId: string;
	oldPassword: string;
	newPassword: string;
};

export async function changePasswordUsecase(cmd: Command) {
	return EitherAsync.liftEither(await AuthRepository.getPassword(cmd.userId))
		.chain(async (oldPasswordHash) => {
			// If the user does not have a password, we set a password here.
			const oldPasswordCorrect = oldPasswordHash
				? await PasswordHashService.compare(cmd.oldPassword, oldPasswordHash)
				: true;

			if (!oldPasswordCorrect) {
				return Left(new InvalidCredentialsError());
			}

			return EitherAsync.liftEither(Right(oldPasswordHash));
		})
		.chain(async () => {
			const hashedNewPassword = await PasswordHashService.hash(cmd.newPassword);
			return await AuthRepository.upsertPassword({
				userId: cmd.userId,
				passwordHash: hashedNewPassword,
			});
		})
		.run();
}
