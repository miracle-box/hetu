import { Static, t } from 'elysia';
import { yggProfileSchema } from '~backend/yggdrasil/yggdrasil.entities';
import { YggdrasilRepository } from '~backend/yggdrasil/yggdrasil.repository';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';

export const hasJoinedQuerySchema = t.Object({
	username: t.String(),
	serverId: t.String(),
	ip: t.Optional(t.String()),
});
export const hasJoinedDataSchema = t.Nullable(yggProfileSchema);
export const hasJoinedResponse200Schema = yggProfileSchema;
export const hasJoinedResponse204Schema = t.Void();

export async function hasJoined(
	query: Static<typeof hasJoinedQuerySchema>,
): Promise<Static<typeof hasJoinedDataSchema>> {
	// [TODO] Support Anylogin
	const joinRecord = await YggdrasilRepository.findJoinRecordById(query.serverId);
	if (!joinRecord) return null;

	// [TODO] Validate client IP
	// [TODO] Validate if username equals to to profile bounded to access token

	const profileRecord = await YggdrasilRepository.getProfileDigestWithSkinsByName(query.username);
	if (!profileRecord) return null;

	return YggdrasilService.getYggdrasilProfile(profileRecord, true);
}
