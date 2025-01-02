import {
	Session,
	sessionSchema,
	SessionScope,
	SessionService,
} from '~backend/services/auth/session';
import { Static, t } from 'elysia';

export const refreshResponseSchema = t.Object({
	session: sessionSchema,
});

export async function refresh(oldSession: Session): Promise<Static<typeof refreshResponseSchema>> {
	await SessionService.invalidate(oldSession.id);

	const session = await SessionService.create(oldSession.userId, {
		scope: SessionScope.DEFAULT,
		metadata: {},
	});

	return {
		session,
	};
}
