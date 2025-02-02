import { Static, t } from 'elysia';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { textureSchema } from '~backend/textures/texture.entities';
import { TexturesRepository } from '~backend/textures/textures.repository';

export const getUserTexturesParamsSchema = t.Object({
	id: t.String(),
});

export const getUserTexturesResponseSchema = t.Object({
	textures: t.Array(textureSchema),
});

export async function getUserTextures(
	params: Static<typeof getUserTexturesParamsSchema>,
	userId: string,
): Promise<Static<typeof getUserTexturesResponseSchema>> {
	// [TODO] Allow get other user's info (profile digest).
	if (userId !== params.id) throw new AppError('users/forbidden');

	return {
		textures: await TexturesRepository.findByUser(params.id),
	};
}
