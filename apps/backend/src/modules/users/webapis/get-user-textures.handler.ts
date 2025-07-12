import { Elysia } from 'elysia';

import { SessionScope } from '#modules/auth/auth.entities';
import { getUserTexturesAction } from '#modules/users/actions/get-user-textures.action';
import { getUserTexturesDtoSchemas } from '#modules/users/dtos/get-user-textures.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

export const getUserTexturesHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).get(
	'/:id/textures',
	async ({ params, user }) => {
		const result = await getUserTexturesAction({
			userId: params.id,
			requestingUserId: user.id,
		});

		return result
			.map((textures) => ({ textures }))
			.mapLeft((error) => {
				switch (error.name) {
					case 'ForbiddenError':
						throw new AppError('forbidden');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...getUserTexturesDtoSchemas,
		detail: {
			summary: 'Get User Textures',
			description: 'Get textures of a user.',
			tags: ['Users'],
			security: [{ session: [] }],
		},
	},
);
