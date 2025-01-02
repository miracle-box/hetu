import { Static, t } from 'elysia';
import { yggProfileDigestSchema } from '~backend/yggdrasil/yggdrasil.entities';
import { YggdrasilRepository } from '~backend/yggdrasil/yggdrasil.repository';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';

export const getProfilesBodySchema = t.Array(t.String());
export const getProfilesResponseSchema = t.Array(yggProfileDigestSchema);

export async function getProfiles(
	body: Static<typeof getProfilesBodySchema>,
): Promise<Static<typeof getProfilesResponseSchema>> {
	return (await YggdrasilRepository.getProfilesDigestByNames(body)).map((profile) =>
		YggdrasilService.getYggdrasilProfileDigest(profile),
	);
}
