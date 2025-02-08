import { SessionService } from '~backend/services/auth/session';
import { Static, t } from 'elysia';
import { AppError } from '~backend/shared/middlewares/errors/app-error';

export const revokeSessionParamsSchema = t.Object({
	id: t.String(),
});
export const revokeSessionResponseSchema = t.Void();

export async function revokeSession(
	params: Static<typeof revokeSessionParamsSchema>,
	userId: string,
): Promise<Static<typeof revokeSessionResponseSchema>> {
	const session = await SessionService.findById(params.id);
	if (session?.userId !== userId) {
		throw new AppError('auth/invalid-session');
	}

	await SessionService.revoke(params.id);
}
