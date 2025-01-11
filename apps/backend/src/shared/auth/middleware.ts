import { Elysia } from 'elysia';
import { SessionService } from '~backend/services/auth/session';
import { Session, SessionScope } from '~backend/auth/auth.entities';
import { readBearerToken } from '~backend/shared/auth/utils';
import { User } from '~backend/users/user.entities';

export const authMiddleware =
	<TScope extends SessionScope>(scope: TScope) =>
	(app: Elysia) =>
		app.derive(async ({ headers }) => {
			const authz = headers['authorization'];
			const bearer = authz ? readBearerToken(authz) : null;
			if (!bearer) throw new Error('Unauthorized');

			const [sessionId, token] = bearer.split(':');
			if (!sessionId || !token) throw new Error('Unauthorized');

			const sessionInfo = (await SessionService.validate(sessionId, token, scope)) satisfies {
				// Workaround for TS4023, the type guard will still work here.
				user: User;
				session: Session<TScope>;
			} | null as {
				user: User;
				session: Session<TScope>;
			} | null;

			if (!sessionInfo) throw new Error('Unauthorized');

			return sessionInfo;
		});
