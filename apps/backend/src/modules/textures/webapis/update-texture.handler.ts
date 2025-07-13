import { Elysia } from 'elysia';
import { SessionScope } from '#modules/auth/auth.entities';
import { updateTextureAction } from '#modules/textures/actions/update-texture.action';
import { updateTextureDtoSchemas } from '#modules/textures/dtos/update-texture.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

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
