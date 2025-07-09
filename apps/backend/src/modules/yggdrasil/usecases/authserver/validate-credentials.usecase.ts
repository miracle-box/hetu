import { EitherAsync, Left, Right } from 'purify-ts';
import { PasswordService } from '../../../../services/auth/password';
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

			const isPasswordValid = await PasswordService.compare(cmd.password, user.passwordHash);

			if (!isPasswordValid) {
				return Left(new YggdrasilInvalidCredentialsError());
			}

			return Right({ user });
		},
	);
};
