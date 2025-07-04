import type { DatabaseError } from '~backend/common/errors/base.error';
import type { Session } from '~backend/modules/auth/auth.entities';
import { Either, EitherAsync, Left, Right } from 'purify-ts';
import { InvalidSessionError } from '../../auth.errors';
import { findSessionUsecase } from '../../usecases/sessions/find-session.usecase';
import { refreshSessionUsecase } from '../../usecases/sessions/refresh-session.usecase';

type Command = {
	sessionId: string;
	userId: string;
};

export async function refreshSessionAction(cmd: Command) {
	return EitherAsync.fromPromise(() => findSessionUsecase({ sessionId: cmd.sessionId }))
		.chain(async (session) => {
			if (!session) {
				return Left(new InvalidSessionError());
			}

			return Right(session);
		})
		.chain(
			async (
				session,
			): Promise<Either<InvalidSessionError | DatabaseError, { session: Session }>> => {
				return await refreshSessionUsecase({
					session,
				});
			},
		)
		.run();
}
