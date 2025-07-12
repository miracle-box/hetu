import { EitherAsync, Left, Right } from 'purify-ts';
import { AuthRepository } from '#modules/auth/auth.repository';
import { PasswordHashService } from '#modules/auth/services/password-hash.service';
import { YggdrasilInvalidCredentialsError } from '#modules/yggdrasil/yggdrasil.errors';

export interface ValidateCredentialsCommand {
	username: string;
	password: string;
}

export const validateCredentialsUsecase = (cmd: ValidateCredentialsCommand) => {
	return EitherAsync.fromPromise(() => AuthRepository.findUserWithPassword(cmd.username)).chain(
		async (user) => {
			if (!user) {
				return Left(new YggdrasilInvalidCredentialsError());
			}

			const isPasswordValid = await PasswordHashService.compare(
				cmd.password,
				user.passwordHash,
			);

			if (!isPasswordValid) {
				return Left(new YggdrasilInvalidCredentialsError());
			}

			return Right({ user });
		},
	);
};
