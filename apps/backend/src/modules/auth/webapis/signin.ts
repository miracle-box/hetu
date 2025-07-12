import { Elysia } from 'elysia';
import { signinAction } from '#modules/auth/actions/signin.action';
import { signinDtoSchemas } from '#modules/auth/dtos/signin.dto';
import { AppError } from '#shared/middlewares/errors/app-error';

export const signinHandler = new Elysia().post(
	'/signin',
	async ({ body }) => {
		const result = await signinAction({
			email: body.email,
			password: body.password,
		});

		return result
			.map((data) => data)
			.mapLeft((error) => {
				switch (error.name) {
					case 'InvalidCredentialsError':
						throw new AppError('auth/invalid-credentials');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...signinDtoSchemas,
		detail: {
			summary: 'Sign In',
			description: 'Sign in by email and password.',
			tags: ['Authentication'],
		},
	},
);
