import { Elysia } from 'elysia';
import { SessionScope } from '#modules/auth/auth.entities';
import { verifyMcClaimAction } from '#modules/users/actions/mc-claims/verify-mc-claim.action';
import { verifyMcClaimDtoSchemas } from '#modules/users/dtos/mc-claims/verify-mc-claim.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

export const verifyMcClaimHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).post(
	'/:id/mc-claims',
	async ({ params, body, user, set }) => {
		const result = await verifyMcClaimAction({
			userId: params.id,
			requestingUserId: user.id,
			verificationId: body.verificationId,
		});

		return result
			.map((result) => {
				if (result.exists) {
					set.status = 200;
				} else {
					set.status = 201;
				}

				return { mcClaim: result.mcClaim };
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'InvalidVerificationError':
						throw new AppError('auth/invalid-verification');
					case 'NoValidMcEntitlementError':
						throw new AppError('users/no-valid-mc-entitlement');
					case 'McApiAuthError':
						throw new AppError('users/mc-claims-auth-error');
					case 'UserNotFoundError':
						throw new AppError('users/not-found');
					case 'McClaimAlreadyExistsError':
						throw new AppError('users/mc-claim-already-bound');
					case 'ForbiddenError':
						throw new AppError('forbidden');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...verifyMcClaimDtoSchemas,
		detail: {
			summary: 'Verify Minecraft Claim',
			description:
				'Verify and bind a Minecraft claim. If the claim already exists, it will be updated.',
			tags: ['Users'],
			security: [{ session: [] }],
		},
	},
);
