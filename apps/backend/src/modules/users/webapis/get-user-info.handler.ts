import { Elysia } from 'elysia';
import { SessionScope } from '~backend/modules/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { getUserInfoAction } from '../actions/get-user-info.action';
import { getUserInfoDtoSchemas } from '../dtos/get-user-info.dtos';

export const getUserInfoHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).get(
	'/:id',
	async ({ params, user }) => {
		const result = await getUserInfoAction({
			userId: params.id,
			requestingUserId: user.id,
		});

		return result
			.map((user) => ({ user }))
			.mapLeft((error) => {
				switch (error.name) {
					case 'UserNotFoundError':
						throw new AppError('users/not-found');
					case 'ForbiddenError':
						throw new AppError('users/forbidden');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...getUserInfoDtoSchemas,
		detail: {
			summary: 'Get User Info',
			description: 'Get account info of a user.',
			tags: ['Users'],
			security: [{ session: [] }],
		},
	},
);
