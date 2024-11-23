import { Static, t } from 'elysia';
import { SessionService } from '~/services/auth/session';
import { yggTokenSchema } from '~/yggdrasil/yggdrasil.entities';

export const invalidateBodySchema = yggTokenSchema;
export const invalidateResponseSchema = t.Void();

export async function invalidate(
	body: Static<typeof invalidateBodySchema>,
): Promise<Static<typeof invalidateResponseSchema>> {
	await SessionService.invalidate(body.accessToken);
}
