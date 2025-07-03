import { EitherAsync, Left, Right } from 'purify-ts';
import { UsersRepository } from '~backend/users/users.repository';
import { SessionScope } from '../auth.entities';
import { InvalidCredentialsError } from '../auth.errors';
import { AuthRepository } from '../auth.repository';
import { PasswordHashService } from '../services/password-hash.service';

type Command = {
	email: string;
	password: string;
};

export async function signinUsecase(command: Command) {
	// [FIXME] Waiting for users repository to be implemented
	const userWithPassword = await UsersRepository.findUserWithPassword(command.email);

	return EitherAsync.liftEither(Right(userWithPassword))
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
