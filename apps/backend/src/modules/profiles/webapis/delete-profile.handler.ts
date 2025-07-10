import { Elysia } from 'elysia';
import { SessionScope } from '~backend/modules/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { deleteProfileAction } from '../actions/delete-profile.action';
import { deleteProfileDtoSchemas } from '../dtos/delete-profile.dto';

export const deleteProfileHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).delete(
	'/:id',
	async ({ user, params, set }) => {
		const result = await deleteProfileAction({
			userId: user.id,
			profileId: params.id,
		});

		return result
			.map(() => {
				set.status = 'No Content';
				return undefined;
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'ProfileNotFoundError':
						throw new AppError('profiles/not-found');
					case 'ForbiddenError':
						throw new AppError('forbidden');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...deleteProfileDtoSchemas,
		detail: {
			summary: 'Delete Profile',
			description: 'Delete a profile for the authenticated user.',
			tags: ['Profiles'],
			security: [{ session: [] }],
		},
	},
);
