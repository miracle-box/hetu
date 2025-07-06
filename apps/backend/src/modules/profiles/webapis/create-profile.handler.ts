import { Elysia } from 'elysia';
import { SessionScope } from '~backend/modules/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createProfileAction } from '../actions/create-profile.action';
import { createProfileDtoSchemas } from '../dtos/create-profile.dto';

export const createProfileHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).post(
	'/',
	async ({ user, body }) => {
		const result = await createProfileAction({
			userId: user.id,
			name: body.name,
			isPrimary: body.isPrimary,
		});

		return result
			.map((profile) => {
				return { profile };
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'ProfileNameAlreadyExistsError':
						throw new AppError('profiles/name-exists');
					case 'PrimaryProfileAlreadyExistsError':
						throw new AppError('profiles/primary-exists');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...createProfileDtoSchemas,
		detail: {
			summary: 'Create Profile',
			description: 'Create a new profile for the authenticated user.',
			tags: ['Profiles'],
			security: [{ session: [] }],
		},
	},
);
