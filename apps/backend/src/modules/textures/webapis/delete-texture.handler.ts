import { Elysia } from 'elysia';
import { SessionScope } from '#modules/auth/auth.entities';
import { deleteTextureAction } from '#modules/textures/actions/delete-texture.action';
import { deleteTextureDtoSchemas } from '#modules/textures/dtos/delete-texture.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

export const deleteTextureHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).delete(
	'/:id',
	async ({ user, params, set }) => {
		const result = await deleteTextureAction({
			userId: user.id,
			textureId: params.id,
		});

		return result
			.map(() => {
				set.status = 'No Content';
				return undefined;
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'TextureNotFoundError':
						throw new AppError('textures/not-found');
					case 'ForbiddenError':
						throw new AppError('forbidden');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...deleteTextureDtoSchemas,
		detail: {
			summary: 'Delete Texture',
			description: 'Delete a texture for the authenticated user.',
			tags: ['Textures'],
			security: [{ session: [] }],
		},
	},
);
