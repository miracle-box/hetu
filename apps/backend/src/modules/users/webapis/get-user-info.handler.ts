import { Elysia } from 'elysia';

import { SessionScope } from '#modules/auth/auth.entities';
import { getUserInfoAction } from '#modules/users/actions/get-user-info.action';
import { getUserInfoDtoSchemas } from '#modules/users/dtos/get-user-info.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

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
						throw new AppError('forbidden');
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
