import { Session, SessionMetadata } from '~backend/auth/auth.entities';
import { AuthRepository } from '~backend/auth/auth.repository';
import { UsersRepository } from '~backend/users/users.repository';
import { nowWithinDate } from '~backend/shared/auth/utils';
import { User } from '~backend/users/user.entities';

/**
 * Session handling related utilities.
 */
export abstract class SessionService {
	static async findUserSessions(userId: string): Promise<Session[]> {
		return await AuthRepository.findSessionsByUser(userId);
	}

	static async findById(sessionId: string): Promise<Session | null> {
		return await AuthRepository.findSessionById(sessionId);
	}

	static async revoke(sessionId: string): Promise<void> {
		await AuthRepository.revokeSessionById(sessionId);
	}

	static async revokeAll(userId: string): Promise<void> {
		await AuthRepository.revokeSessionsByUser(userId);
	}

	static async validate(
		sessionId: string,
		token: string,
	): Promise<{ user: User; session: Session } | null> {
		const session = await AuthRepository.findSessionById(sessionId);
		if (!session) return null;
		if (session.token !== token) return null;
		if (!nowWithinDate(session.expiresAt)) return null;

		const user = await UsersRepository.findById(session.userId);
		if (!user) return null;

		// Auto renew session if it's close to expiration
		// [TODO] Should be configurable (now 7 days)
		if (nowWithinDate(new Date(session.expiresAt.getTime() - 1000 * 3600 * 24 * 7))) {
			await AuthRepository.renewSession(
				sessionId,
				// [TODO] Should be configurable (now 30 days)
				new Date(Date.now() + 1000 * 3600 * 24 * 30),
			);
		}

		return { user, session };
	}

	static async create(userId: string, metadata: SessionMetadata): Promise<Session> {
		return AuthRepository.createSession({
			userId,
			metadata,
			// [TODO] Should be configurable (now 30 days)
			expiresAt: new Date(Date.now() + 1000 * 3600 * 24 * 30),
		});
	}
}
