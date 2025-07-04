import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionScope, SessionLifecycle } from '~backend/modules/auth/auth.entities';
import { getLifecycle, isSessionOfScope } from '~backend/shared/auth/utils';
import { UserNotFoundError } from '../../users/users.errors';
import { UsersRepository } from '../../users/users.repository';
import { InvalidSessionError } from '../auth.errors';
import { findSessionUsecase } from '../usecases/sessions/find-session.usecase';

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
				const user = await UsersRepository.findUserById(session.userId);
				return user
					.mapLeft(() => new UserNotFoundError(session.userId))
					.map((user) => ({ user, session }));
			})
			.run();
	}
}
