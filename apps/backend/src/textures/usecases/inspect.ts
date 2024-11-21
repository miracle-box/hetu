import { Static, t } from 'elysia';
import { textureSchema } from '~/textures/texture.entities';
import { TexturesRepository } from '~/textures/textures.repository';

export const inspectParamsSchema = t.Object({
	id: t.String(),
});
export const inspectResponseSchema = textureSchema;

export async function inspect(
	params: Static<typeof inspectParamsSchema>,
): Promise<Static<typeof inspectResponseSchema>> {
	const texture = await TexturesRepository.findById(params.id);

	if (!texture) {
		throw new Error('Texture not found');
	}

	return texture;
}
