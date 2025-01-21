import { textureSchema, TextureType } from '~backend/textures/texture.entities';
import { Static, t } from 'elysia';
import { TexturesRepository } from '~backend/textures/textures.repository';

export const createBodySchema = t.Object({
	name: t.String({ minLength: 3, maxLength: 128 }),
	description: t.String(),
	type: t.Enum(TextureType),
	hash: t.String(),
});
export const createResponseSchema = textureSchema;

export async function create(
	body: Static<typeof createBodySchema>,
	userId: string,
): Promise<Static<typeof createResponseSchema>> {
	// If the same file exists (in the same user), don't create it
	const existingTexture = await TexturesRepository.findUserTextureByHash(
		userId,
		body.type,
		body.hash,
	);
	// [TODO] Provide existing texture id for redirecting.
	if (existingTexture) throw new Error('Texture already exists');

	const texture = await TexturesRepository.create({
		authorId: userId,
		name: body.name,
		description: body.description,
		type: body.type,
		hash: body.hash,
	});
	if (!texture) throw new Error('Failed to create texture');

	return texture;
}
