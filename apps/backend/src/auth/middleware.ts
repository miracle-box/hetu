import Elysia from 'elysia';
import { Session } from '~/models/session';
import { User } from '~/models/user';
import { lucia, SessionScope } from './lucia';

export const authMiddleware = (scope: SessionScope) => (app: Elysia) =>
	app.derive(async ({ headers }) => {
		const authz = headers['authorization'];
		const bearer = authz ? lucia.readBearerToken(authz) : null;
		// [TODO] Manage all errors in one place
		if (!bearer) throw new Error('Unauthorized');

		const { session: luciaSession, user: luciaUser } = await lucia.validateSession(bearer);
		if (!luciaSession || luciaSession.scope !== scope) throw new Error('Unauthorized');

		return {
			session: luciaSession,
			user: luciaUser,
		} satisfies {
			session: Session;
			user: User;
		};
	});
