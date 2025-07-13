import { Elysia } from 'elysia';
import { SessionScope } from '#modules/auth/auth.entities';
import { createProfileAction } from '#modules/profiles/actions/create-profile.action';
import { createProfileDtoSchemas } from '#modules/profiles/dtos/create-profile.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

export const createProfileHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).post(
	'/',
	async ({ user, body, set }) => {
		const result = await createProfileAction({
			userId: user.id,
			name: body.name,
		});

		return result
			.map((profile) => {
				set.status = 201;
				return { profile };
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'ProfileNameAlreadyExistsError':
						throw new AppError('profiles/name-exists');
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
