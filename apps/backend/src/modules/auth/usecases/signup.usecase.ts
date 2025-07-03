import { Left } from 'purify-ts';
import { DatabaseError } from '~backend/common/errors/base.error';
import { withTransaction } from '~backend/shared/db';
import { UsersRepository } from '~backend/users/users.repository';
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

export async function signupUsecase(command: Command) {
	const { name, email, password, verificationId } = command;

	if (await UsersRepository.emailOrNameExists(email, name)) {
		return Left(new UserExistsError(email));
	}

	// Verify verification
	const verif = await AuthRepository.findVerifiedVerification(
		verificationId,
		VerificationScenario.SIGNUP,
	);
	if (!verif) {
		return Left(new InvalidVerificationError());
	}

	await AuthRepository.revokeVerificationById(verificationId);

	// Create user and password
	// [FIXME] Waiting for password service to be implemented
	const passwordHash = await PasswordHashService.hash(password);

	const user = await withTransaction(async ({ transaction }) => {
		const insertedUser = await UsersRepository.insertUser({
			name,
			email,
		});

		if (!insertedUser) {
			transaction.rollback();
			return;
		}

		await AuthRepository.upsertPassword({
			userId: insertedUser.id,
			passwordHash,
		});

		return insertedUser;
	});

	if (!user) {
		return Left(
			new DatabaseError(
				'Can not create user and password.',
				'Can not create user and password.',
			),
		);
	}

	// Create session
	return (
		await AuthRepository.createSession({
			userId: user.id,
			metadata: {
				scope: SessionScope.DEFAULT,
			},
		})
	).map((session) => ({ session }));
}
