import { Elysia } from 'elysia';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { confirmOauth2BindingAction } from '../../actions/oauth2/confirm-oauth2-binding.action';
import { SessionScope } from '../../auth.entities';
import { confirmOauth2BindingDtoSchemas } from '../../dtos/oauth2/confirm-oauth2-binding.dto';

export const confirmOauth2BindingHandler = new Elysia()
	.use(authMiddleware(SessionScope.DEFAULT))
	.post(
		'/oauth2/bind/:verificationId/confirm',
		async ({ session, params, set }) => {
			const result = await confirmOauth2BindingAction({
				verificationId: params.verificationId,
				userId: session.userId,
			});

			return (
				result
					.ifRight((data) => {
						if (data.created) {
							set.status = 'Created';
						} else {
							set.status = 'No Content';
						}
					})
					// Returns void
					.map(() => undefined)
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
							case 'DatabaseError':
								throw new AppError('internal-error');
						}
					})
					.extract()
			);
		},
		{
			...confirmOauth2BindingDtoSchemas,
			detail: {
				summary: 'Confirm OAuth2 Binding',
				description: 'Confirm OAuth2 account binding.',
				tags: ['Authentication'],
				security: [{ session: [] }],
			},
		},
	);
