import { Elysia, NotFoundError, Static, t } from 'elysia';
import { YggdrasilRepository } from '~backend/yggdrasil/yggdrasil.repository';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';
import { TexturesRepository } from '~backend/textures/textures.repository';
import { TextureType } from '~backend/textures/texture.entities';
import { uploadTexture as uploadTextureUsecase } from '~backend/files/usecases/upload-texture';
import { FileType } from '~backend/files/files.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { SessionScope } from '~backend/auth/auth.entities';

export const uploadTextureHandler = new Elysia().use(authMiddleware(SessionScope.YGGDRASIL)).put(
	'/user/profile/:id/:type',
	async ({ params, body, set }) => {
		const profile = await YggdrasilRepository.getProfileDigestById(params.id);
		if (!profile) throw new NotFoundError();

		// Upload file
		const uploadedFile = await uploadTextureUsecase(
			body.file,
			params.type === 'skin' ? FileType.TEXTURE_SKIN : FileType.TEXTURE_CAPE,
		);

		const description = `Uploaded via Yggdrasil API on ${new Date().toISOString()}.\nOriginal file name: ${body.file.name}`;
		const texture = await TexturesRepository.create({
			authorId: profile.id,
			hash: uploadedFile.hash,
			name: body.file.name,
			description,
			type:
				params.type === 'cape'
					? TextureType.CAPE
					: body.model === 'slim'
						? TextureType.SKIN_SLIM
						: TextureType.SKIN,
		});

		if (params.type === 'cape')
			await ProfilesRepository.update(profile.id, { capeTextureId: texture.id });

		if (params.type === 'skin')
			await ProfilesRepository.update(profile.id, { skinTextureId: texture.id });

		set.status = 'No Content';
	},
	{
		params: t.Object({
			id: t.String(),
			type: t.Union([t.Literal('skin'), t.Literal('cape')]),
		}),
		body: t.Object({
			model: t.Optional(t.Union([t.Literal(''), t.Literal('slim')])),
			file: t.File({ type: 'image/png' }),
		}),
		response: {
			204: t.Void(),
		},
		detail: {
			summary: 'Upload Texture',
			description:
				"Upload texture for profile, will automatically create a new texture if it doesn't exist.",
			security: [{ session: [] }],
			tags: ['Yggdrasil'],
		},
	},
);
