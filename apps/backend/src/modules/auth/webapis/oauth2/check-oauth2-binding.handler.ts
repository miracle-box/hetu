import { Elysia } from 'elysia';
import { checkOauth2BindingAction } from '#modules/auth/actions/oauth2/check-oauth2-binding.action';
import { SessionScope } from '#modules/auth/auth.entities';
import { checkOauth2BindingDtoSchemas } from '#modules/auth/dtos/oauth2/check-oauth2-binding.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

export const checkOauth2BindingHandler = new Elysia()
	.use(authMiddleware(SessionScope.DEFAULT))
	.post(
		'/oauth2/bind/:verificationId/check',
		async ({ session, params }) => {
			const result = await checkOauth2BindingAction({
				verificationId: params.verificationId,
				userId: session.userId,
			});

			return result
				.map((data) => ({
					user: data.user,
					oauth2Profile: data.oauth2Profile,
					alreadyBound: data.alreadyBound,
				}))
				.mapLeft((error) => {
					switch (error.name) {
						case 'VerificationNotExistsError':
							throw new AppError('auth/verification-not-exists');
						case 'InvalidOauth2ProviderError':
							throw new AppError('auth/invalid-oauth2-provider');
						case 'Oauth2MisconfiguredError':
							throw new AppError('auth/oauth2-misconfigured');
						case 'Oauth2AlreadyBoundError':
							throw new AppError('auth/oauth2-already-bound');
						case 'UserNotFoundError':
							throw new AppError('users/not-found');
						case 'DatabaseError':
							throw new AppError('internal-error');
					}
				})
				.extract();
		},
		{
			...checkOauth2BindingDtoSchemas,
			detail: {
				summary: 'Inspect OAuth2 Binding',
				description: 'Inspect OAuth2 account info before binding.',
				tags: ['Authentication'],
				security: [{ session: [] }],
			},
		},
	);
