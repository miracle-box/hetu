import { Static, t } from 'elysia';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';
import { profileSchema } from '~backend/profiles/profile.entities';
import { TexturesRepository } from '~backend/textures/textures.repository';
import { TextureType } from '~backend/textures/texture.entities';
import { AppError } from '~backend/shared/middlewares/errors/app-error';

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
export const updateResponseSchema = t.Object({
	profile: profileSchema,
});

export async function update(
	params: Static<typeof updateParamsSchema>,
	body: Static<typeof updateBodySchema>,
	userId: string,
): Promise<Static<typeof updateResponseSchema>> {
	const profile = await ProfilesRepository.findById(params.id);
	if (!profile) throw new AppError('profiles/not-exists');
	if (profile.authorId != userId) throw new AppError('profiles/forbidden');

	if (body.skinTextureId) {
		const skinTexture = await TexturesRepository.findById(body.skinTextureId);
		if (
			!skinTexture ||
			(skinTexture.type !== TextureType.SKIN && skinTexture.type !== TextureType.SKIN_SLIM)
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
}
