import { Elysia } from 'elysia';
import { revokeAllSessionsAction } from '#modules/auth/actions/sessions/revoke-all-sessions.action';
import { SessionScope } from '#modules/auth/auth.entities';
import { revokeAllSessionsDtoSchemas } from '#modules/auth/dtos/sessions/revoke-all-sessions.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

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
