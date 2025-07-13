import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionScope } from '#modules/auth/auth.entities';
import { InvalidCredentialsError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { PasswordHashService } from '#modules/auth/services/password-hash.service';

type Command = {
	email: string;
	password: string;
};

export async function signinUsecase(command: Command) {
	return EitherAsync.fromPromise(() => AuthRepository.findUserWithPassword(command.email))
		.chain(async (user) => {
			if (!user) {
				return Left(new InvalidCredentialsError());
			}

			const passwordCorrect = await PasswordHashService.compare(
				command.password,
				user.passwordHash,
			);
			if (!passwordCorrect) {
				return Left(new InvalidCredentialsError());
			}

			return Right(user);
		})
		.chain(async (user) => {
			return AuthRepository.createSession({
				userId: user.id,
				metadata: {
					scope: SessionScope.DEFAULT,
				},
			});
		})
		.map((session) => ({ session }))
		.run();
}
