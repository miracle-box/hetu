import { sessionDigestSchema, SessionService } from '~backend/services/auth/session';
import { Static, t } from 'elysia';

export const listSessionsResponseSchema = t.Object({
	sessions: t.Array(sessionDigestSchema),
});

export async function listSessions(
	userId: string,
): Promise<Static<typeof listSessionsResponseSchema>> {
	return {
		sessions: await SessionService.getUserSessions(userId),
	};
}
