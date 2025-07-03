import { EitherAsync, Left, Right } from 'purify-ts';
import { InvalidSessionError } from '../../auth.errors';
import { AuthRepository } from '../../auth.repository';
import { findSessionUsecase } from '../../usecases/sessions/find-session.usecase';

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
