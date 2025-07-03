import { Elysia } from 'elysia';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { revokeSessionAction } from '../../actions/sessions/revoke-session.action';
import { SessionScope } from '../../auth.entities';
import { revokeSessionDtoSchemas } from '../../dtos/sessions/revoke-session.dto';

export const revokeSessionHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).delete(
	'/sessions/:id',
	async ({ params, user, set }) => {
		const result = await revokeSessionAction({
			sessionId: params.id,
			userId: user.id,
		});

		result
			.map(() => {
				set.status = 'No Content';
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'InvalidSessionError':
						throw new AppError('auth/invalid-session');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...revokeSessionDtoSchemas,
		detail: {
			summary: 'Revoke Session',
			description: 'Invalidate a specific session of the current user.',
			tags: ['Authentication'],
			security: [{ session: [] }],
		},
	},
);
