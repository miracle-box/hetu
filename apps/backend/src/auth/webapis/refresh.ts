import { Elysia, t } from 'elysia';
import { Session, sessionSchema, SessionScope } from '~backend/auth/auth.entities';
import { SessionService } from '~backend/services/auth/session';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const refreshHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).post(
	'/sessions/refresh',
	async ({ session }) => {
		await SessionService.revoke(session.id);

		const newSession = (await SessionService.create(session.userId, {
			scope: SessionScope.DEFAULT,
		})) as Session<typeof SessionScope.DEFAULT>;

		return { session: newSession };
	},
	{
		response: {
			200: t.Object({
				session: sessionSchema(t.Literal(SessionScope.DEFAULT)),
			}),
			...createErrorResps(),
		},
		detail: {
			summary: 'Refresh Session',
			description: 'Invalidate the current session and create a new one.',
			tags: ['Authentication'],
			security: [{ session: [] }],
		},
	},
);
