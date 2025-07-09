import type { User } from '~backend/modules/users/users.entities';
import {
	SessionLifecycle,
	type Session,
	type SessionMetadata,
} from '~backend/modules/auth/auth.entities';
import { SessionScope } from '~backend/modules/auth/auth.entities';
import { AuthRepository } from '~backend/modules/auth/auth.repository';
import { getLifecycle, isSessionOfScope } from '~backend/shared/auth/utils';
import { UsersRepository } from '~backend/users/users.repository';

/**
 * Session handling related utilities.
 * @deprecated this is the old one
 */
export abstract class SessionService {
	static async revoke(sessionId: string): Promise<void> {
		const result = await AuthRepository.revokeSessionById(sessionId);
		result.caseOf({
			Left: (error) => {
				throw new Error(`Failed to revoke session: ${error.message}`);
			},
			Right: () => {},
		});
	}

	static async revokeAll(userId: string): Promise<void> {
		const result = await AuthRepository.revokeSessionsByUser(userId);
		result.caseOf({
			Left: (error) => {
				throw new Error(`Failed to revoke all sessions: ${error.message}`);
			},
			Right: () => {},
		});
	}

	static async validate<TScope extends SessionScope>(
		sessionId: string,
		token: string,
		scope: TScope,
		allowedLifecycle: SessionLifecycle[],
	): Promise<{ user: User; session: Session } | null> {
		const sessionResult = await AuthRepository.findSessionById(sessionId);
		const session = sessionResult.caseOf({
			Left: (error) => {
				throw new Error(`Failed to find session: ${error.message}`);
			},
			Right: (session) => session,
		});

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
		const result = await AuthRepository.createSession({
			userId,
			metadata,
		});
		return result.caseOf({
			Left: (error) => {
				throw new Error(`Failed to create session: ${error.message}`);
			},
			Right: (session) => session,
		});
	}
}
