import { Elysia, t } from 'elysia';
import { TexturesRepository } from '~backend/textures/textures.repository';
import { StorageService } from '~backend/services/storage';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { SessionScope } from '~backend/auth/auth.entities';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const getImageHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).get(
	'/:id/image',
	async ({ params, redirect }) => {
		const texture = await TexturesRepository.findById(params.id);

		if (!texture) {
			throw new AppError('textures/not-found');
		}

		// [TODO] Needs to move url fetching into files module
		const url = StorageService.getPublicUrl(texture.hash);
		redirect(url, 302);
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		response: {
			302: t.Void(),
			...createErrorResps(404),
		},
		detail: {
			summary: 'Get Texture Image',
			description: 'Redirect to actual file URL for a specific texture.',
			tags: ['Textures'],
			security: [{ session: [] }],
		},
	},
);
