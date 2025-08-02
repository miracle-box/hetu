import { Elysia } from 'elysia';

import { SessionScope } from '#modules/auth/auth.entities';
import { removeMcClaimAction } from '#modules/users/actions/mc-claims/remove-mc-claim.action';
import { removeMcClaimDtoSchemas } from '#modules/users/dtos/mc-claims/remove-mc-claim.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

export const removeMcClaimHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).delete(
	'/:id/mc-claims/:mcClaimId',
	async ({ params, user, set }) => {
		const result = await removeMcClaimAction({
			userId: params.id,
			requestingUserId: user.id,
			mcClaimId: params.mcClaimId,
		});

		return result
			.map(() => {
				set.status = 204;
				return;
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'UserNotFoundError':
						throw new AppError('users/not-found');
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
		...removeMcClaimDtoSchemas,
		detail: {
			summary: 'Delete MC Claim',
			description: 'Delete a Minecraft claim.',
			tags: ['Users'],
			security: [{ session: [] }],
		},
	},
);
