import { Static, t } from 'elysia';
import { TexturesRepository } from '~backend/textures/textures.repository';
import { StorageService } from '~backend/services/storage';
import { AppError } from '~backend/shared/middlewares/errors/app-error';

export const getImageParamsSchema = t.Object({
	id: t.String(),
});
export const getImageResponseSchema = t.Void();
export const getImageDataSchema = t.String();

export async function getImage(
	params: Static<typeof getImageParamsSchema>,
): Promise<Static<typeof getImageDataSchema>> {
	const texture = await TexturesRepository.findById(params.id);

	if (!texture) {
		throw new AppError('textures/not-found');
	}

	// [TODO] Needs to move url fetching into files module
	return StorageService.getPublicUrl(texture.hash);
}
