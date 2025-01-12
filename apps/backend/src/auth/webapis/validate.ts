import { Static, t } from 'elysia';
import { Session, sessionSchema, SessionScope } from '~backend/auth/auth.entities';
import { refreshResponseSchema } from '~backend/auth/webapis/refresh';
import { AuthRepository } from '~backend/auth/auth.repository';

export const validateResponseSchema = t.Object({
	session: sessionSchema(t.Literal(SessionScope.DEFAULT)),
});

export async function validate(
	session: Session<typeof SessionScope.DEFAULT>,
): Promise<Static<typeof refreshResponseSchema>> {
	// Renew session
	const renewedSession = (await AuthRepository.renewSession(
		session.id,
		// [TODO] Should be configurable (now 30 days)
		new Date(Date.now() + 1000 * 3600 * 24 * 30),
	)) as Session<typeof SessionScope.DEFAULT>;

	return {
		session: renewedSession,
	};
}
