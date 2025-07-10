import { Elysia } from 'elysia';
import { SessionLifecycle, SessionScope } from '~backend/modules/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { validateSessionAction } from '../../actions/sessions/validate-session.action';
import { validateSessionDtoSchemas } from '../../dtos/sessions/validate-session.dto';

export const validateSessionHandler = new Elysia()
	.use(
		authMiddleware(SessionScope.DEFAULT, {
			allowedLifecycle: [SessionLifecycle.Active, SessionLifecycle.Renewable],
		}),
	)
	.post(
		'/validate',
		async ({ session }) => {
			const result = await validateSessionAction({
				sessionId: session.id,
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
			...validateSessionDtoSchemas,
			detail: {
				summary: 'Validate Session',
				description: 'Validate the current session, will renew if the session is active.',
				tags: ['Authentication'],
				security: [{ session: [] }],
			},
		},
	);
