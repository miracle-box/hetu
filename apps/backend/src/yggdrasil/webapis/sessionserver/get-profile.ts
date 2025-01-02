import { Static, t } from 'elysia';
import { yggProfileSchema } from '~backend/yggdrasil/yggdrasil.entities';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';
import { YggdrasilRepository } from '~backend/yggdrasil/yggdrasil.repository';

export const getProfileParamsSchema = t.Object({
	id: t.String(),
});
export const getProfileQuerySchema = t.Object({
	unsigned: t.Optional(t.Boolean()),
});
export const getProfileResponseSchema = yggProfileSchema;

export async function getProfile(
	params: Static<typeof getProfileParamsSchema>,
	query: Static<typeof getProfileQuerySchema>,
): Promise<Static<typeof getProfileResponseSchema>> {
	const unsigned = query.unsigned ?? true;
	const profileWithSkins = await YggdrasilRepository.getProfileDigestWithSkinsById(params.id);
	if (!profileWithSkins) throw new Error('Profile not found!');

	return YggdrasilService.getYggdrasilProfile(profileWithSkins, !unsigned);
}
