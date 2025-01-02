import { Static, t } from 'elysia';
import { YggdrasilRepository } from '~backend/yggdrasil/yggdrasil.repository';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';
import { TexturesRepository } from '~backend/textures/textures.repository';
import { TextureType } from '~backend/textures/texture.entities';
import { uploadTexture as uploadTextureUsecase } from '~backend/files/usecases/upload-texture';
import { FileType } from '~backend/files/files.entities';

export const uploadTextureParamsSchema = t.Object({
	id: t.String(),
	type: t.Union([t.Literal('skin'), t.Literal('cape')]),
});
export const uploadTextureBodySchema = t.Object({
	model: t.Optional(t.Union([t.Literal(''), t.Literal('slim')])),
	file: t.File({ type: 'image/png' }),
});
export const uploadTextureResponseSchema = t.Void();

export async function uploadTexture(
	params: Static<typeof uploadTextureParamsSchema>,
	body: Static<typeof uploadTextureBodySchema>,
): Promise<Static<typeof uploadTextureResponseSchema>> {
	const profile = await YggdrasilRepository.getProfileDigestById(params.id);
	if (!profile) throw new Error('Profile not found');

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
}
