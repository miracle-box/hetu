import { EitherAsync, Left, Right } from 'purify-ts';
import { PasswordHashService } from '~backend/modules/auth/services/password-hash.service';
import { AuthRepository } from '../../../auth/auth.repository';
import { YggdrasilInvalidCredentialsError } from '../../yggdrasil.errors';

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
