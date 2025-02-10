import { Elysia, t } from 'elysia';
import { SessionScope } from '~backend/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';
import { textureSchema } from '~backend/textures/texture.entities';
import { TexturesRepository } from '~backend/textures/textures.repository';

export const inspectHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).get(
	'/:id',
	async ({ params }) => {
		const texture = await TexturesRepository.findById(params.id);

		if (!texture) {
			throw new AppError('textures/not-found');
		}

		return { texture };
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		response: {
			200: t.Object({
				texture: textureSchema,
			}),
			...createErrorResps(404),
		},
		detail: {
			summary: 'Get Texture',
			description: 'Get a specific texture.',
			tags: ['Textures'],
			security: [{ session: [] }],
		},
	},
);
