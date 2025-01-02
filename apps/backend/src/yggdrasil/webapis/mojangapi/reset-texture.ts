import { Static, t } from 'elysia';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';

export const resetTextureParamsSchema = t.Object({
	id: t.String(),
	type: t.Union([t.Literal('skin'), t.Literal('cape')]),
});
export const resetTextureResponseSchema = t.Void();

export async function resetTexture(
	params: Static<typeof resetTextureParamsSchema>,
): Promise<Static<typeof resetTextureResponseSchema>> {
	if (params.type === 'skin') await ProfilesRepository.update(params.id, { skinTextureId: null });
	if (params.type === 'cape') await ProfilesRepository.update(params.id, { capeTextureId: null });
}
