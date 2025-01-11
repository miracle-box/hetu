import { Static, t } from 'elysia';
import { Session, sessionSchema, SessionScope } from '~backend/auth/auth.entities';
import { refreshResponseSchema } from '~backend/auth/webapis/refresh';

export const validateResponseSchema = t.Object({
	session: sessionSchema(t.Literal(SessionScope.DEFAULT)),
});

export async function validate(
	session: Session<typeof SessionScope.DEFAULT>,
): Promise<Static<typeof refreshResponseSchema>> {
	// Handled by the middleware
	return { session };
}
