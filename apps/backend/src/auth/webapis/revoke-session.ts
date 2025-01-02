import { SessionService } from '~backend/services/auth/session';
import { Static, t } from 'elysia';

export const revokeSessionParamsSchema = t.Object({
	uid: t.String(),
});
export const revokeSessionResponseSchema = t.Void();

export async function revokeSession(
	userId: string,
	uid: string,
): Promise<Static<typeof revokeSessionResponseSchema>> {
	await SessionService.revoke(userId, uid);
}
