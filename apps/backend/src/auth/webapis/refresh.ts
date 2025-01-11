import { Static, t } from 'elysia';
import { Session, sessionSchema, SessionScope } from '~backend/auth/auth.entities';
import { SessionService } from '~backend/services/auth/session';

export const refreshResponseSchema = t.Object({
	session: sessionSchema(t.Literal(SessionScope.DEFAULT)),
});

export async function refresh(
	oldSession: Session<typeof SessionScope.DEFAULT>,
): Promise<Static<typeof refreshResponseSchema>> {
	await SessionService.revoke(oldSession.id);

	const session = (await SessionService.create(oldSession.userId, {
		scope: SessionScope.DEFAULT,
	})) as Session<typeof SessionScope.DEFAULT>;

	return {
		session,
	};
}
