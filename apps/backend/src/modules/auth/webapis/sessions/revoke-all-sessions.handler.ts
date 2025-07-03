import { Elysia } from 'elysia';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { revokeAllSessionsAction } from '../../actions/sessions/revoke-all-sessions.action';
import { SessionScope } from '../../auth.entities';
import { revokeAllSessionsDtoSchemas } from '../../dtos/sessions/revoke-all-sessions.dto';

export const revokeAllSessionsHandler = new Elysia()
	.use(authMiddleware(SessionScope.DEFAULT))
	.delete(
		'/sessions',
		async ({ user, set }) => {
			const result = await revokeAllSessionsAction({
				userId: user.id,
			});

			result
				.map(() => {
					set.status = 'No Content';
				})
				.mapLeft((error) => {
					switch (error.name) {
						case 'DatabaseError':
							throw new AppError('internal-error');
					}
				})
				.extract();
		},
		{
			...revokeAllSessionsDtoSchemas,
			detail: {
				summary: 'Revoke All Sessions',
				description: 'Invalidate all sessions for the current user.',
				tags: ['Authentication'],
				security: [{ session: [] }],
			},
		},
	);
