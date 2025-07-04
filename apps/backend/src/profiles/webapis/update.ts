import { Elysia, t } from 'elysia';
import { SessionScope } from '~backend/modules/auth/auth.entities';
import { profileSchema } from '~backend/profiles/profile.entities';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';
import { TextureType } from '~backend/textures/texture.entities';
import { TexturesRepository } from '~backend/textures/textures.repository';

export const updateHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).patch(
	'/:id',
	async ({ params, body, user }) => {
		const profile = await ProfilesRepository.findById(params.id);
		if (!profile) throw new AppError('profiles/not-exists');
		if (profile.authorId != user.id) throw new AppError('profiles/forbidden');

		if (body.skinTextureId) {
			const skinTexture = await TexturesRepository.findById(body.skinTextureId);
			if (
				!skinTexture ||
				(skinTexture.type !== TextureType.SKIN &&
					skinTexture.type !== TextureType.SKIN_SLIM)
			)
				throw new AppError('profiles/skin-invalid');
		}

		if (body.capeTextureId) {
			const capeTexture = await TexturesRepository.findById(body.capeTextureId);
			if (!capeTexture || capeTexture.type !== TextureType.CAPE)
				throw new AppError('profiles/cape-invalid');
		}

		return {
			profile: await ProfilesRepository.update(params.id, body),
		};
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		body: t.Partial(
			t.Object({
				name: t.String(),
				skinTextureId: t.String(),
				capeTextureId: t.String(),
			}),
		),
		response: {
			200: t.Object({
				profile: profileSchema,
			}),
			...createErrorResps(400, 403, 404),
		},
		detail: {
			summary: 'Edit profile',
			description: 'Edit a part of the profile.',
			tags: ['Profiles'],
			security: [{ session: [] }],
		},
	},
);
