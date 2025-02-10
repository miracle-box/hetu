import { Elysia, t } from 'elysia';
import { SessionService } from '~backend/services/auth/session';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { SessionScope } from '../auth.entities';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const revokeAllSessionsHandler = new Elysia()
	.use(authMiddleware(SessionScope.DEFAULT))
	.delete(
		'/sessions',
		async ({ user, set }) => {
			set.status = 'No Content';
			await SessionService.revokeAll(user.id);
		},
		{
			response: {
				204: t.Void(),
				...createErrorResps(),
			},
			detail: {
				summary: 'Revoke All Sessions',
				description: 'Invalidate all sessions for the current user.',
				tags: ['Authentication'],
				security: [{ session: [] }],
			},
		},
	);
