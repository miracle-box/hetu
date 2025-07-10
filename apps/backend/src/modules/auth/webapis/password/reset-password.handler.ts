import { Elysia } from 'elysia';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { resetPasswordAction } from '../../actions/password/reset-password.action';
import { resetPasswordDtoSchemas } from '../../dtos';

export const resetPasswordHandler = new Elysia().post(
	'/reset-password',
	async ({ body }) => {
		const result = await resetPasswordAction({
			verificationId: body.verificationId,
			newPassword: body.newPassword,
		});

		return result
			.map((data) => data)
			.mapLeft((error) => {
				switch (error.name) {
					case 'InvalidVerificationError':
						throw new AppError('auth/invalid-verification');
					case 'UserNotFoundError':
						throw new AppError('users/not-found');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...resetPasswordDtoSchemas,
		detail: {
			summary: 'Reset Password',
			description: 'Reset password after verifying your identity.',
			tags: ['Authentication'],
		},
	},
);
