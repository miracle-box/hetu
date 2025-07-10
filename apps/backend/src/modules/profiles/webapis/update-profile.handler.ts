import { Elysia } from 'elysia';
import { SessionScope } from '~backend/modules/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { updateProfileAction } from '../actions/update-profile.action';
import { updateProfileDtoSchemas } from '../dtos/update-profile.dto';

export const updateProfileHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).put(
	'/:id',
	async ({ user, params, body }) => {
		const result = await updateProfileAction({
			userId: user.id,
			profileId: params.id,
			name: body.name,
			skinTextureId: body.skinTextureId,
			capeTextureId: body.capeTextureId,
		});

		return result
			.map((profile) => {
				return { profile };
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'ProfileNotFoundError':
						throw new AppError('profiles/not-found');
					case 'ProfileNameAlreadyExistsError':
						throw new AppError('profiles/name-exists');
					case 'ForbiddenError':
						throw new AppError('forbidden');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...updateProfileDtoSchemas,
		detail: {
			summary: 'Update Profile',
			description: 'Update an existing profile for the authenticated user.',
			tags: ['Profiles'],
			security: [{ session: [] }],
		},
	},
);
