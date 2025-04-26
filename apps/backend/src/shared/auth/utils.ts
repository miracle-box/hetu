import { SessionLifecycle, type Session } from '~backend/auth/auth.entities';
import { SessionScope } from '~backend/auth/auth.entities';
import { Config } from '../config';

/**
 * Reads the Bearer token from the authorization header.
 *
 * @param authorizationHeader - The authorization header.
 */
export function readBearerToken(authorizationHeader: string): string | null {
	const [authScheme, token] = authorizationHeader.split(' ') as [string, string | undefined];
	if (authScheme !== 'Bearer') {
		return null;
	}
	return token ?? null;
}

/**
 * Type Guard to check if a session has a specific scope.
 *
 * @param session - The session to check.
 * @param scope - The desired scope.
 * @returns True if the session matches the scope, otherwise false.
 */
export function isSessionOfScope<TScope extends SessionScope>(
	session: Session,
	scope: TScope,
	// @ts-expect-error [TODO] Don't know how to fix, but it works for now.
): session is Session<TScope> {
	return session.metadata.scope === scope;
}

export function getLifecycle(session?: Session | null): SessionLifecycle {
	if (!session) return SessionLifecycle.Expired;

	const lifeTime = Date.now() - session.createdAt.getTime();

	if (lifeTime > Config.app.session.maxLifespanMs) return SessionLifecycle.Expired;
	if (lifeTime > Config.app.session.inactiveAfterMs) return SessionLifecycle.RefreshOnly;
	if (Date.now() - session.updatedAt.getTime() > Config.app.session.ttlMs)
		return SessionLifecycle.Renewable;

	return SessionLifecycle.Active;
}
