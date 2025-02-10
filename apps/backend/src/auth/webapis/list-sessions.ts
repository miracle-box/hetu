import { Elysia, t } from 'elysia';
import { sessionDigestSchema, SessionScope, sessionScopeSchema } from '~backend/auth/auth.entities';
import { SessionService } from '~backend/services/auth/session';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const listSessionsHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).get(
	'/sessions',
	async ({ user }) => {
		return {
			sessions: await SessionService.findUserSessions(user.id),
		};
	},
	{
		response: {
			200: t.Object({
				sessions: t.Array(sessionDigestSchema(sessionScopeSchema)),
			}),
			...createErrorResps(),
		},
		detail: {
			summary: 'List Sessions',
			description: 'Get digest of all sessions of the current user.',
			tags: ['Authentication'],
			security: [{ session: [] }],
		},
	},
);
