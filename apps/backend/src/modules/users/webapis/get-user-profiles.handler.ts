import { Elysia } from 'elysia';
import { SessionScope } from '~backend/modules/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { getUserProfilesAction } from '../actions/get-user-profiles.action';
import { getUserProfilesDtoSchemas } from '../dtos/get-user-profiles.dtos';

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
						throw new AppError('users/forbidden');
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
