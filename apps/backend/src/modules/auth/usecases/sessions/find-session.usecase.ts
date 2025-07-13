import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionLifecycle } from '#modules/auth/auth.entities';
import { InvalidSessionError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { getLifecycle } from '#shared/auth/utils';

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
