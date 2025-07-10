import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionLifecycle } from '~backend/modules/auth/auth.entities';
import { getLifecycle } from '~backend/shared/auth/utils';
import { InvalidSessionError } from '../../auth.errors';
import { AuthRepository } from '../../auth.repository';

type Command = {
	sessionId: string;
};

export async function findSessionUsecase(cmd: Command) {
	return EitherAsync.fromPromise(() => AuthRepository.findSessionById(cmd.sessionId))
		.chain(async (session) => {
			if (!session || getLifecycle(session) === SessionLifecycle.Expired) {
				return Left(new InvalidSessionError());
			}
			return Right(session);
		})
		.run();
}
