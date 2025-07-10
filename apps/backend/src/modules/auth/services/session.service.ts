import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionScope, SessionLifecycle } from '~backend/modules/auth/auth.entities';
import { getLifecycle, isSessionOfScope } from '~backend/shared/auth/utils';
import { UserNotFoundError } from '../../users/users.errors';
import { UsersRepository } from '../../users/users.repository';
import { InvalidSessionError } from '../auth.errors';
import { findSessionUsecase } from '../usecases/sessions/find-session.usecase';

export abstract class SessionValidationService {
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
				return (await UsersRepository.findUserById(session.userId)).chain((user) => {
					if (!user) {
						return Left(new UserNotFoundError(session.userId));
					}

					return Right({ user, session });
				});
			})
			.run();
	}
}
