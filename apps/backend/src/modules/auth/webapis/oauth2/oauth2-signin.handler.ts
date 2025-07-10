import { Elysia } from 'elysia';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { oauth2SigninAction } from '../../actions/oauth2/oauth2-signin.action';
import { oauth2SigninDtoSchemas } from '../../dtos/oauth2/oauth2-signin.dto';

export const oauth2SigninHandler = new Elysia().post(
	'/oauth2/signin',
	async ({ body }) => {
		const result = await oauth2SigninAction({
			verificationId: body.verificationId,
		});

		return result
			.map((data) => ({
				session: data.session,
			}))
			.mapLeft((error) => {
				switch (error.name) {
					case 'VerificationNotExistsError':
						throw new AppError('auth/verification-not-exists');
					case 'InvalidOauth2ProviderError':
						throw new AppError('auth/invalid-oauth2-provider');
					case 'Oauth2MisconfiguredError':
						throw new AppError('auth/oauth2-misconfigured');
					case 'Oauth2NotBoundError':
						throw new AppError('auth/oauth2-not-bound');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...oauth2SigninDtoSchemas,
		detail: {
			summary: 'OAuth2 Sign In',
			description: 'OAuth2 social sign in endpoint.',
			tags: ['Authentication'],
		},
	},
);
