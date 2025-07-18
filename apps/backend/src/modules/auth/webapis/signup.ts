import { Elysia } from 'elysia';
import { signupAction } from '#modules/auth/actions/signup.action';
import { InvalidVerificationError, UserExistsError } from '#modules/auth/auth.errors';
import { signupDtoSchemas } from '#modules/auth/dtos/signup.dto';
import { AppError } from '#shared/middlewares/errors/app-error';

export const signupHandler = new Elysia().post(
	'/signup',
	async ({ body }) => {
		const result = await signupAction({
			name: body.name,
			email: body.email,
			password: body.password,
			verificationId: body.verificationId,
		});

		return result
			.map((data) => data)
			.mapLeft((error) => {
				if (error instanceof UserExistsError) {
					throw new AppError('auth/user-exists');
				}
				if (error instanceof InvalidVerificationError) {
					throw new AppError('auth/invalid-verification');
				}
				throw new AppError('internal-error');
			})
			.extract();
	},
	{
		...signupDtoSchemas,
		detail: {
			summary: 'Sign Up',
			description: 'Sign up by username, email and password.',
			tags: ['Authentication'],
		},
	},
);
