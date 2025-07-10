import { Elysia } from 'elysia';
import { SessionScope } from '~backend/modules/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { deleteTextureAction } from '../actions/delete-texture.action';
import { deleteTextureDtoSchemas } from '../dtos/delete-texture.dto';

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
