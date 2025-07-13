import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionScope, VerificationScenario } from '#modules/auth/auth.entities';
import { InvalidVerificationError, UserExistsError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { PasswordHashService } from '#modules/auth/services/password-hash.service';
import { UsersRepository } from '#modules/users/users.repository';

type Command = {
	name: string;
	email: string;
	password: string;
	verificationId: string;
};

export async function signupUsecase(cmd: Command) {
	return EitherAsync.fromPromise(() => UsersRepository.emailOrNameExists(cmd.email, cmd.name))
		.chain(async (exists) => {
			if (exists) {
				return Left(new UserExistsError(cmd.email));
			}
			return Right(undefined);
		})
		.chain(async () => {
			// Verify verification
			const verifResult = await AuthRepository.findVerifiedVerification(
				cmd.verificationId,
				VerificationScenario.SIGNUP,
			);
			const verif = verifResult.extract();
			if (!verif) {
				return Left(new InvalidVerificationError());
			}

			await AuthRepository.revokeVerificationById(cmd.verificationId);

			return Right(undefined);
		})
		.chain(async () => {
			return await UsersRepository.createUser({
				name: cmd.name,
				email: cmd.email,
			});
		})
		.chain(async (user) => {
			// Create user and password
			const passwordHash = await PasswordHashService.hash(cmd.password);

			await AuthRepository.upsertPassword({
				userId: user.id,
				passwordHash,
			});

			return Right(user);
		})
		.chain(async (user) => {
			return await AuthRepository.createSession({
				userId: user.id,
				metadata: {
					scope: SessionScope.DEFAULT,
				},
			});
		})
		.map((session) => ({ session }))
		.run();
}
