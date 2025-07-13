import type { DatabaseError } from '#common/errors/base.error';
import type { Session } from '#modules/auth/auth.entities';
import { Either, EitherAsync, Left, Right } from 'purify-ts';
import { InvalidSessionError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { renewSessionUsecase } from '#modules/auth/usecases/sessions/renew-session.usecase';

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
