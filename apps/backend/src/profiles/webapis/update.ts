import { Static, t } from 'elysia';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';
import { profileSchema } from '~backend/profiles/profile.entities';
import { TexturesRepository } from '~backend/textures/textures.repository';
import { TextureType } from '~backend/textures/texture.entities';

export const updateParamsSchema = t.Object({
	id: t.String(),
});
export const updateBodySchema = t.Partial(
	t.Object({
		name: t.String(),
		skinTextureId: t.String(),
		capeTextureId: t.String(),
	}),
);
export const updateResponseSchema = profileSchema;

export async function update(
	params: Static<typeof updateParamsSchema>,
	body: Static<typeof updateBodySchema>,
	userId: string,
): Promise<Static<typeof updateResponseSchema>> {
	const profile = await ProfilesRepository.findById(params.id);
	if (!profile) throw new Error('Profile does not exist');

	if (profile.authorId != userId) throw new Error('Profile does not exist.');

	if (body.skinTextureId) {
		const skinTexture = await TexturesRepository.findById(body.skinTextureId);
		if (!skinTexture) throw new Error('Skin texture does not exist.');
		if (!(skinTexture.type === TextureType.SKIN || skinTexture.type === TextureType.SKIN_SLIM))
			throw new Error('Skin texture invalid.');
	}

	if (body.capeTextureId) {
		const capeTexture = await TexturesRepository.findById(body.capeTextureId);
		if (!capeTexture) throw new Error('Cape texture does not exist.');
		if (!(capeTexture.type === TextureType.CAPE)) throw new Error('Cape texture invalid.');
	}

	return await ProfilesRepository.update(params.id, body);
}
