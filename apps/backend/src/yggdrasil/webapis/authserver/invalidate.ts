import { Static, t } from 'elysia';
import { SessionService } from '~backend/services/auth/session';
import { yggTokenSchema } from '~backend/yggdrasil/yggdrasil.entities';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';

export const invalidateBodySchema = yggTokenSchema;
export const invalidateResponseSchema = t.Void();

export async function invalidate(
	body: Static<typeof invalidateBodySchema>,
): Promise<Static<typeof invalidateResponseSchema>> {
	const accessToken = YggdrasilService.parseAccessToken(body.accessToken);
	if (!accessToken) throw new Error('Invalid session!');

	await SessionService.revoke(accessToken.sessionId);
}
