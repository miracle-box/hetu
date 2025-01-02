import { lucia } from '~backend/shared/auth/lucia';

export async function revokeAllSessions(userId: string): Promise<void> {
	await lucia.invalidateUserSessions(userId);
}
