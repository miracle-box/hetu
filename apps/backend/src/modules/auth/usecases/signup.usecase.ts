import { EitherAsync, Left, Right } from 'purify-ts';
import { UsersRepository } from '../../users/users.repository';
import { SessionScope, VerificationScenario } from '../auth.entities';
import { InvalidVerificationError, UserExistsError } from '../auth.errors';
import { AuthRepository } from '../auth.repository';
import { PasswordHashService } from '../services/password-hash.service';

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
