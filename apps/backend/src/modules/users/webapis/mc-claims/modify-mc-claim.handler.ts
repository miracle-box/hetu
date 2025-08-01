import { Elysia } from 'elysia';

import { SessionScope } from '#modules/auth/auth.entities';
import { modifyMcClaimAction } from '#modules/users/actions/mc-claims/modify-mc-claim.action';
import { modifyMcClaimDtoSchemas } from '#modules/users/dtos/mc-claims/modify-mc-claim.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

export const modifyMcClaimHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).patch(
	'/:userId/mc-claims/:id',
	async ({ params, body, user }) => {
		const result = await modifyMcClaimAction({
			userId: params.userId,
			requestingUserId: user.id,
			mcClaimId: params.id,
			boundProfileId: body.boundProfileId,
		});

		return result
			.map((mcClaim) => ({ mcClaim }))
			.mapLeft((error) => {
				switch (error.name) {
					case 'UserNotFoundError':
						throw new AppError('users/not-found');
					case 'ProfileNotFoundError':
						throw new AppError('profiles/not-found');
					case 'McClaimNotFoundError':
						throw new AppError('users/mc-claim-not-found');
					case 'ForbiddenError':
						throw new AppError('forbidden');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...modifyMcClaimDtoSchemas,
		detail: {
			summary: 'Update MC Claim',
			description: 'Update Minecraft claim information (partial update).',
			tags: ['Users', 'MC Claims'],
			security: [{ session: [] }],
		},
	},
);
