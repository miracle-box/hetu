import Elysia from 'elysia';
import { auth } from '.';

export const authMiddleware = (app: Elysia) =>
	app.derive(async ({ headers }) => {
		const authz = headers['authorization'];
		const bearer = authz ? auth.readBearerToken(authz) : null;
		// [TODO] Manage all errors in one place
		if (!bearer) throw new Error('Unauthorized');

		const { session, user } = await auth.validateSession(bearer);
		if (!session) throw new Error('Unauthorized');

		return {
			session: session,
			user: user,
		};
	});
