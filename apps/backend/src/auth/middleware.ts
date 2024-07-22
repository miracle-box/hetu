import Elysia from 'elysia';
import { Session } from '~/models/session';
import { User } from '~/models/user';
import { auth } from '.';

export const authMiddleware = (app: Elysia) =>
	app.derive(async ({ headers }) => {
		const authz = headers['authorization'];
		const bearer = authz ? auth.readBearerToken(authz) : null;
		// [TODO] Manage all errors in one place
		if (!bearer) throw new Error('Unauthorized');

		const { session: luciaSession, user: luciaUser } = await auth.validateSession(bearer);
		if (!luciaSession) throw new Error('Unauthorized');

		return {
			session: {
				id: luciaSession.id,
				uid: luciaSession.uid,
				userId: luciaSession.userId,
				expiresAt: luciaSession.expiresAt,
			},
			user: {
				id: luciaUser.id,
				name: luciaUser.name,
				email: luciaUser.email,
			},
		} satisfies {
			session: Session;
			user: User;
		};
	});
