import { Elysia } from 'elysia';
import { SessionScope } from '~backend/modules/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createTextureAction } from '../actions/create-texture.action';
import { createTextureDtoSchemas } from '../dtos/create-texture.dto';

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
