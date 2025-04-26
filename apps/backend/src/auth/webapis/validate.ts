import type { Session } from '~backend/auth/auth.entities';
import { Elysia, t } from 'elysia';
import { SessionLifecycle, sessionSchema, SessionScope } from '~backend/auth/auth.entities';
import { SessionService } from '~backend/services/auth/session';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const validateHandler = new Elysia()
	.use(
		authMiddleware(SessionScope.DEFAULT, {
			allowedLifecycle: [SessionLifecycle.Active, SessionLifecycle.Renewable],
		}),
	)
	.post(
		'/validate',
		async ({ session }) => {
			// Renew session
			const renewedSession = (await SessionService.renew(session.id)) as Session<
				typeof SessionScope.DEFAULT
			>;

			return {
				session: renewedSession,
			};
		},
		{
			response: {
				200: t.Object({
					session: sessionSchema(t.Literal(SessionScope.DEFAULT)),
				}),
				...createErrorResps(),
			},
			detail: {
				summary: 'Validate Session',
				description: 'Validate the current session, will renew if the session is active.',
				tags: ['Authentication'],
				security: [{ session: [] }],
			},
		},
	);
