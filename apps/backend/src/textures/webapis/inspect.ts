import { Static, t } from 'elysia';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { textureSchema } from '~backend/textures/texture.entities';
import { TexturesRepository } from '~backend/textures/textures.repository';

export const inspectParamsSchema = t.Object({
	id: t.String(),
});
export const inspectResponseSchema = t.Object({
	texture: textureSchema,
});

export async function inspect(
	params: Static<typeof inspectParamsSchema>,
): Promise<Static<typeof inspectResponseSchema>> {
	const texture = await TexturesRepository.findById(params.id);

	if (!texture) {
		throw new AppError('textures/not-found');
	}

	return { texture };
}
