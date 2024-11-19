import Elysia from 'elysia';
import { lucia } from './lucia';
import { SessionScope, SessionService } from '~/services/auth/session';

export const authMiddleware = (scope: SessionScope) => (app: Elysia) =>
	app.derive(async ({ headers }) => {
		const authz = headers['authorization'];
		// [TODO] We will implement our own authentication related utilities,
		//  	  So let us put this util here for now.
		// 		  See: SessionService
		const bearer = authz ? lucia.readBearerToken(authz) : null;
		if (!bearer) throw new Error('Unauthorized');

		const sessionInfo = await SessionService.validate(bearer);
		if (sessionInfo?.session.scope !== scope) throw new Error('Unauthorized');

		return sessionInfo;
	});
