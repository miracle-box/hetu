import type { Session } from '~backend/auth/auth.entities';
import type { DatabaseError } from '~backend/common/errors/base.error';
import { Either, EitherAsync, Left, Right } from 'purify-ts';
import { InvalidSessionError } from '../../auth.errors';
import { AuthRepository } from '../../auth.repository';
import { renewSessionUsecase } from '../../usecases/sessions/renew-session.usecase';

type Command = {
	sessionId: string;
};

export async function validateSessionAction(cmd: Command) {
	// sessionId is validated in the middleware
	return await EitherAsync.fromPromise(() => AuthRepository.findSessionById(cmd.sessionId))
		.chain(async (session) => {
			if (!session) {
				return Left(new InvalidSessionError());
			}
			return Right(session);
		})
		.chain(async (session): Promise<Either<InvalidSessionError | DatabaseError, Session>> => {
			return await renewSessionUsecase({
				session,
			});
		})
		.map((session) => ({ session }))
		.run();
}
