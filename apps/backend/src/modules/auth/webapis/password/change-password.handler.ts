import { Elysia } from 'elysia';
import { changePasswordAction } from '#modules/auth/actions/password/change-password.action';
import { SessionScope } from '#modules/auth/auth.entities';
import { changePasswordDtoSchemas } from '#modules/auth/dtos';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

export const changePasswordHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).post(
	'/change-password',
	async ({ user, body }) => {
		const result = await changePasswordAction({
			userId: user.id,
			oldPassword: body.oldPassword,
			newPassword: body.newPassword,
		});

		return result
			.mapLeft((error) => {
				switch (error.name) {
					case 'InvalidCredentialsError':
						throw new AppError('auth/invalid-credentials');
					case 'UserNotFoundError':
						throw new AppError('users/not-found');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...changePasswordDtoSchemas,
		detail: {
			summary: 'Change Password',
			description: 'Change password of current user.',
			tags: ['Authentication'],
			security: [{ session: [] }],
		},
	},
);
