import { Elysia } from 'elysia';
import { SessionScope } from '#modules/auth/auth.entities';
import { createTextureAction } from '#modules/textures/actions/create-texture.action';
import { createTextureDtoSchemas } from '#modules/textures/dtos/create-texture.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

export const createTextureHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).post(
	'/',
	async ({ user, body, set }) => {
		const result = await createTextureAction({
			userId: user.id,
			name: body.name,
			description: body.description,
			type: body.type,
			hash: body.hash,
		});

		return result
			.map((texture) => {
				set.status = 201;
				return { texture };
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'TextureFileExistsForUserError':
						throw new AppError('textures/already-exists');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...createTextureDtoSchemas,
		detail: {
			summary: 'Create Texture',
			description: 'Create a new texture for the authenticated user.',
			tags: ['Textures'],
			security: [{ session: [] }],
		},
	},
);
