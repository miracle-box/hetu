import { Static, t } from 'elysia';
import { TexturesRepository } from '~/textures/textures.repository';
import { StorageService } from '~/services/storage';

export const getImageParamsSchema = t.Object({
	id: t.String(),
});
export const getImageResponseSchema = t.Void();
export const getImageDataSchema = t.String();

export async function getImage(
	params: Static<typeof getImageParamsSchema>,
): Promise<Static<typeof getImageDataSchema>> {
	const texture = await TexturesRepository.findByIdWithFile(params.id);

	if (!texture) {
		throw new Error('Texture not found');
	}

	// [TODO] Needs to move url fetching into files module
	return StorageService.getPublicUrl(texture.file.hash);
}
