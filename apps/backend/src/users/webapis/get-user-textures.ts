import { Static, t } from 'elysia';
import { textureSchema } from '~backend/textures/texture.entities';
import { TexturesRepository } from '~backend/textures/textures.repository';

export const getUserTexturesParamsSchema = t.Object({
	id: t.String(),
});

export const getUserTexturesResponseSchema = t.Array(textureSchema);

export async function getUserTextures(
	params: Static<typeof getUserTexturesParamsSchema>,
	userId: string,
): Promise<Static<typeof getUserTexturesResponseSchema>> {
	// [TODO] Allow get other user's info (profile digest).
	if (userId !== params.id) throw new Error('You can only get your own info.');

	return await TexturesRepository.findByUser(params.id);
}
