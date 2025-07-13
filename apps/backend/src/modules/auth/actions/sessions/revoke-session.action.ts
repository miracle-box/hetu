import { EitherAsync, Left, Right } from 'purify-ts';
import { InvalidSessionError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { findSessionUsecase } from '#modules/auth/usecases/sessions/find-session.usecase';

type Command = {
	sessionId: string;
	userId: string;
};

export async function revokeSessionAction(cmd: Command) {
	return EitherAsync.fromPromise(() => findSessionUsecase({ sessionId: cmd.sessionId }))
		.chain(async (session) => {
			if (!session || session.userId !== cmd.userId) {
				return Left(new InvalidSessionError());
			}

			return Right(undefined);
		})
		.chain(async () => {
			return AuthRepository.revokeSessionById(cmd.sessionId);
		})
		.run();
}
