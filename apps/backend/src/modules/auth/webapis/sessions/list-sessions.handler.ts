import { Elysia } from 'elysia';
import { listSessionsAction } from '#modules/auth/actions/sessions/list-sessions.action';
import { SessionScope } from '#modules/auth/auth.entities';
import { listSessionsDtoSchemas } from '#modules/auth/dtos/sessions/list-sessions.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

export const listSessionsHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).get(
	'/sessions',
	async ({ user }) => {
		const result = await listSessionsAction({
			userId: user.id,
		});

		return result
			.map((data) => data)
			.mapLeft((error) => {
				switch (error.name) {
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...listSessionsDtoSchemas,
		detail: {
			summary: 'List Sessions',
			description: 'Get digest of all sessions of the current user.',
			tags: ['Authentication'],
			security: [{ session: [] }],
		},
	},
);
