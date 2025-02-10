import { Elysia, t } from 'elysia';
import { Session, sessionSchema, SessionScope } from '~backend/auth/auth.entities';
import { AuthRepository } from '~backend/auth/auth.repository';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const validateHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).post(
	'/validate',
	async ({ session }) => {
		// Renew session
		const renewedSession = (await AuthRepository.renewSession(
			session.id,
			// [TODO] Should be configurable (now 30 days)
			new Date(Date.now() + 1000 * 3600 * 24 * 30),
		)) as Session<typeof SessionScope.DEFAULT>;

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
			description:
				'Validate the current session, will renew if the session is about to expire.',
			tags: ['Authentication'],
			security: [{ session: [] }],
		},
	},
);
