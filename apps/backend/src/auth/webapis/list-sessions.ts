import { Static, t } from 'elysia';
import { sessionDigestSchema } from '~backend/auth/auth.entities';
import { SessionService } from '~backend/services/auth/session';

export const listSessionsResponseSchema = t.Object({
	sessions: t.Array(sessionDigestSchema),
});

export async function listSessions(
	userId: string,
): Promise<Static<typeof listSessionsResponseSchema>> {
	return {
		sessions: await SessionService.findUserSessions(userId),
	};
}
