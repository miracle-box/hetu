import { Session, SessionScope } from '~backend/auth/auth.entities';

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
 * Checks if a date is in the future.
 * @param date - The date to check.
 */
export function nowWithinDate(date: Date): boolean {
	return Date.now() < date.getTime();
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
	// @ts-ignore [TODO] Don't know how to fix, but it works for now.
): session is Session<TScope> {
	return session.metadata.scope === scope;
}
