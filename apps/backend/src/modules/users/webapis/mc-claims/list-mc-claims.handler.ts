import { Elysia } from 'elysia';

import { SessionScope } from '#modules/auth/auth.entities';
import { listMcClaimsAction as listMcClaimsAction } from '#modules/users/actions/mc-claims/list-mc-claims.action';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';
import { listMcClaimsDtoSchemas } from '../../dtos';

export const listMcClaimsHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).get(
	'/:userId/mc-claims',
	async ({ params, user }) => {
		const result = await listMcClaimsAction({
			userId: params.userId,
			requestingUserId: user.id,
		});

		return result
			.map((mcClaims) => ({ mcClaims }))
			.mapLeft((error) => {
				switch (error.name) {
					case 'UserNotFoundError':
						throw new AppError('users/not-found');
					case 'ForbiddenError':
						throw new AppError('forbidden');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...listMcClaimsDtoSchemas,
		detail: {
			summary: 'List Minecraft Claims',
			description: 'Get a list of all verified Minecraft claims for a user.',
			tags: ['Users'],
			security: [{ session: [] }],
		},
	},
);
