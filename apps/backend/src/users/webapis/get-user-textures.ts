import { Elysia, t } from 'elysia';
import { SessionScope } from '~backend/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';
import { textureSchema } from '~backend/textures/texture.entities';
import { TexturesRepository } from '~backend/textures/textures.repository';

export const getUserTexturesHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).get(
	'/:id/textures',
	async ({ params, user }) => {
		// [TODO] Allow get other user's info (profile digest).
		if (user.id !== params.id) throw new AppError('users/forbidden');

		return {
			textures: await TexturesRepository.findByUser(params.id),
		};
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		response: {
			200: t.Object({
				textures: t.Array(textureSchema),
			}),
			...createErrorResps(403),
		},
		detail: {
			summary: 'Get User Textures',
			description: 'Get textures of a user.',
			tags: ['Users'],
			security: [{ session: [] }],
		},
	},
);
