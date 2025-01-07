import { Static, t } from 'elysia';
import { SessionService } from '~backend/services/auth/session';
import { yggTokenSchema } from '~backend/yggdrasil/yggdrasil.entities';
import { Session, SessionScope } from '~backend/auth/auth.entities';

export const invalidateBodySchema = yggTokenSchema;
export const invalidateResponseSchema = t.Void();

export async function invalidate(
	body: Static<typeof invalidateBodySchema>,
	session: Session<typeof SessionScope.YGGDRASIL>,
): Promise<Static<typeof invalidateResponseSchema>> {
	await SessionService.revoke(session.id);
}
