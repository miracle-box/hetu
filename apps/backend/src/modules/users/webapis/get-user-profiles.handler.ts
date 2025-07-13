import { Elysia } from 'elysia';

import { SessionScope } from '#modules/auth/auth.entities';
import { getUserProfilesAction } from '#modules/users/actions/get-user-profiles.action';
import { getUserProfilesDtoSchemas } from '#modules/users/dtos/get-user-profiles.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

export const getUserProfilesHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).get(
	'/:id/profiles',
	async ({ params, user }) => {
		const result = await getUserProfilesAction({
			userId: params.id,
			requestingUserId: user.id,
		});

		return result
			.map((profiles) => ({ profiles }))
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
		...getUserProfilesDtoSchemas,
		detail: {
			summary: 'Get User Profiles',
			description: 'Get profiles of a user.',
			tags: ['Users'],
			security: [{ session: [] }],
		},
	},
);
