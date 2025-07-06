import { Elysia } from 'elysia';
import { SessionScope } from '~backend/modules/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { updateTextureAction } from '../actions/update-texture.action';
import { updateTextureDtoSchemas } from '../dtos/update-texture.dto';

export const updateTextureHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).put(
	'/:id',
	async ({ user, params, body }) => {
		const result = await updateTextureAction({
			userId: user.id,
			textureId: params.id,
			name: body.name,
			description: body.description,
		});

		return result
			.map((texture) => {
				return { texture };
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
		...updateTextureDtoSchemas,
		detail: {
			summary: 'Update Texture',
			description: 'Update an existing texture for the authenticated user.',
			tags: ['Textures'],
			security: [{ session: [] }],
		},
	},
);
