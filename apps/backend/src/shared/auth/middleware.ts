import { Elysia } from 'elysia';
import { SessionService } from '~backend/services/auth/session';
import { SessionScope } from '~backend/auth/auth.entities';
import { readBearerToken } from '~backend/shared/auth/utils';

export const authMiddleware = (scope: SessionScope) => (app: Elysia) =>
	app.derive(async ({ headers }) => {
		const authz = headers['authorization'];
		const bearer = authz ? readBearerToken(authz) : null;
		if (!bearer) throw new Error('Unauthorized');

		const [sessionId, token] = bearer.split(':');
		if (!sessionId || !token) throw new Error('Unauthorized');

		const sessionInfo = await SessionService.validate(sessionId, token);
		if (!sessionInfo) throw new Error('Unauthorized');
		if (sessionInfo.session.metadata.scope !== scope) throw new Error('Unauthorized');

		return sessionInfo;
	});
