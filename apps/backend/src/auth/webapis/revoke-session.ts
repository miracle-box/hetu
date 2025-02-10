import { Elysia, t } from 'elysia';
import { SessionService } from '~backend/services/auth/session';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { SessionScope } from '../auth.entities';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const revokeSessionHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).delete(
	'/sessions/:id',
	async ({ params, user, set }) => {
		const session = await SessionService.findById(params.id);
		if (session?.userId !== user.id) {
			throw new AppError('auth/invalid-session');
		}

		await SessionService.revoke(params.id);
		set.status = 'No Content';
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		response: {
			204: t.Void(),
			...createErrorResps(400),
		},
		detail: {
			summary: 'Revoke Session',
			description: 'Invalidate a specific session of the current user.',
			tags: ['Authentication'],
			security: [{ session: [] }],
		},
	},
);
