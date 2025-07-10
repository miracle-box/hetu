import { Elysia } from 'elysia';
import { SessionLifecycle, SessionScope } from '~backend/modules/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { refreshSessionAction } from '../../actions/sessions/refresh-session.action';
import { refreshSessionDtoSchemas } from '../../dtos/sessions/refresh-session.dto';

export const refreshSessionHandler = new Elysia()
	.use(
		authMiddleware(SessionScope.DEFAULT, {
			allowedLifecycle: [
				SessionLifecycle.Active,
				SessionLifecycle.Renewable,
				SessionLifecycle.RefreshOnly,
			],
		}),
	)
	.post(
		'/sessions/refresh',
		async ({ session }) => {
			const result = await refreshSessionAction({
				sessionId: session.id,
				userId: session.userId,
			});

			return result
				.map((data) => data)
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
			...refreshSessionDtoSchemas,
			detail: {
				summary: 'Refresh Session',
				description: 'Invalidate the current session and create a new one.',
				tags: ['Authentication'],
				security: [{ session: [] }],
			},
		},
	);
