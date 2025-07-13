import { Elysia } from 'elysia';
import { revokeSessionAction } from '#modules/auth/actions/sessions/revoke-session.action';
import { SessionScope } from '#modules/auth/auth.entities';
import { revokeSessionDtoSchemas } from '#modules/auth/dtos/sessions/revoke-session.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

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
