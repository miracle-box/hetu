import { Elysia, t } from 'elysia';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';
import { profileSchema } from '~backend/profiles/profile.entities';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { SessionScope } from '~backend/auth/auth.entities';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const getUserProfilesHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).get(
	'/:id/profiles',
	async ({ params, user }) => {
		// [TODO] Allow get other user's info (profile digest).
		if (user.id !== params.id) throw new AppError('users/forbidden');

		return {
			profiles: await ProfilesRepository.findByUser(params.id),
		};
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		response: {
			200: t.Object({
				profiles: t.Array(profileSchema),
			}),
			...createErrorResps(403),
		},
		detail: {
			summary: 'Get User Profiles',
			description: 'Get profiles of a user.',
			tags: ['Users'],
			security: [{ session: [] }],
		},
	},
);
