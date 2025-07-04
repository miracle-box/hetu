import { Elysia, t } from 'elysia';
import { SessionScope } from '~backend/modules/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';
import { textureSchema, TextureType } from '~backend/textures/texture.entities';
import { TexturesRepository } from '~backend/textures/textures.repository';

export const createHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).post(
	'/',
	async ({ user, body, set }) => {
		// If the same file exists (in the same user), don't create it
		const existingTexture = await TexturesRepository.findUserTextureByHash(
			user.id,
			body.type,
			body.hash,
		);
		// [TODO] Provide existing texture id for redirecting.
		if (existingTexture) throw new AppError('textures/file-exists');

		const texture = await TexturesRepository.create({
			authorId: user.id,
			name: body.name,
			description: body.description,
			type: body.type,
			hash: body.hash,
		});

		set.status = 'Created';
		return { texture };
	},
	{
		body: t.Object({
			name: t.String({ minLength: 3, maxLength: 128 }),
			description: t.String(),
			type: t.Enum(TextureType),
			hash: t.String(),
		}),
		response: {
			201: t.Object({
				texture: textureSchema,
			}),
			...createErrorResps(409),
		},
		detail: {
			summary: 'Create Texture',
			description: 'Create a new texture.',
			tags: ['Textures'],
			security: [{ session: [] }],
		},
	},
);
