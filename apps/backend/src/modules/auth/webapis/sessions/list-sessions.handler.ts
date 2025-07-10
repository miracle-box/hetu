import { Elysia } from 'elysia';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { listSessionsAction } from '../../actions/sessions/list-sessions.action';
import { SessionScope } from '../../auth.entities';
import { listSessionsDtoSchemas } from '../../dtos/sessions/list-sessions.dto';

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
