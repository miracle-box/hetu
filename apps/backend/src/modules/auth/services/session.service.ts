import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionScope, SessionLifecycle } from '~backend/auth/auth.entities';
import { getLifecycle, isSessionOfScope } from '~backend/shared/auth/utils';
import { UsersRepository } from '~backend/users/users.repository';
import { InvalidSessionError } from '../auth.errors';
import { findSessionUsecase } from '../usecases/sessions/find-session.usecase';
import { UserNotFoundError } from '../user.errors';

export abstract class SessionService {
	/**
	 * Validate session and user.
	 *
	 * @param sessionId - Session ID
	 * @param token - Session token
	 * @param scope - Session scope
	 * @param allowedLifecycle - Allowed session lifecycles
	 */
	static async validate<TScope extends SessionScope>(
		sessionId: string,
		token: string,
		scope: TScope,
		allowedLifecycle: SessionLifecycle[],
	) {
		return EitherAsync.liftEither(await findSessionUsecase({ sessionId }))
			.chain(async (session) => {
				if (
					!session ||
					session.token !== token ||
					!allowedLifecycle.includes(getLifecycle(session)) ||
					!isSessionOfScope(session, scope)
				) {
					return Left(new InvalidSessionError());
				}

				return Right({ session });
			})
			.chain(async ({ session }) => {
				const user = await UsersRepository.findById(session.userId);
				if (!user) return Left(new UserNotFoundError(session.userId));

				return Right({ user, session });
			})
			.run();
	}
}
