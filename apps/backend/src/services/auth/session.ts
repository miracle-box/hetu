import type { User } from '~backend/users/user.entities';
import { SessionLifecycle, type Session, type SessionMetadata } from '~backend/auth/auth.entities';
import { SessionScope } from '~backend/auth/auth.entities';
import { AuthRepository } from '~backend/auth/auth.repository';
import { getLifecycle, isSessionOfScope } from '~backend/shared/auth/utils';
import { UsersRepository } from '~backend/users/users.repository';
import { withTransaction } from '~backend/shared/db';

/**
 * Session handling related utilities.
 */
export abstract class SessionService {
	static async findUserSessions(userId: string): Promise<Session[]> {
		return (await AuthRepository.findSessionsByUser(userId)).filter(
			(session) => getLifecycle(session) !== SessionLifecycle.Expired,
		);
	}

	static async findById(sessionId: string): Promise<Session | null> {
		const session = await AuthRepository.findSessionById(sessionId);
		if (getLifecycle(session) === SessionLifecycle.Expired) return null;
		return session;
	}

	static async revoke(sessionId: string): Promise<void> {
		await AuthRepository.revokeSessionById(sessionId);
	}

	static async revokeAll(userId: string): Promise<void> {
		await AuthRepository.revokeSessionsByUser(userId);
	}

	static async validate<TScope extends SessionScope>(
		sessionId: string,
		token: string,
		scope: TScope,
		allowedLifecycle: SessionLifecycle[],
	): Promise<{ user: User; session: Session<TScope> } | null> {
		const session = await AuthRepository.findSessionById(sessionId);
		if (
			!session ||
			session.token !== token ||
			getLifecycle(session) === SessionLifecycle.Expired ||
			!allowedLifecycle.includes(getLifecycle(session)) ||
			!isSessionOfScope(session, scope)
		) {
			return null;
		}

		const user = await UsersRepository.findById(session.userId);
		if (!user) return null;

		return { user, session };
	}

	static async create(userId: string, metadata: SessionMetadata): Promise<Session> {
		return AuthRepository.createSession({
			userId,
			metadata,
		});
	}

	static async renew(id: string): Promise<Session> {
		return await withTransaction(async () => {
			const session = await AuthRepository.findSessionById(id);
			const lifecycle = getLifecycle(session);
			if (
				lifecycle === SessionLifecycle.RefreshOnly ||
				lifecycle === SessionLifecycle.Expired
			) {
				throw new Error('Session is not active and can not be renewed.');
			}

			return await AuthRepository.updateSession(id, {
				updatedAt: new Date(),
			});
		});
	}
}
