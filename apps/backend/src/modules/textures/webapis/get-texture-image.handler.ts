import { Elysia } from 'elysia';
import { SessionScope } from '#modules/auth/auth.entities';
import { getTextureImageAction } from '#modules/textures/actions/get-texture-image.action';
import { getTextureImageDtoSchemas } from '#modules/textures/dtos/get-texture-image.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

export const getTextureImageHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).get(
	'/:id/image',
	async ({ user, params, redirect }) => {
		const result = await getTextureImageAction({
			userId: user.id,
			textureId: params.id,
		});

		return result
			.map((url) => {
				redirect(url, 302);
				return undefined;
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'TextureNotFoundError':
						throw new AppError('textures/not-found');
					case 'ForbiddenError':
						throw new AppError('forbidden');
					case 'StorageError':
						throw new AppError('internal-error');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...getTextureImageDtoSchemas,
		detail: {
			summary: 'Get Texture Image',
			description: 'Redirect to actual file URL for a specific texture.',
			tags: ['Textures'],
			security: [{ session: [] }],
		},
	},
);
