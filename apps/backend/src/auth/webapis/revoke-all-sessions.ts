import { lucia } from '~/shared/auth/lucia';

export async function revokeAllSessions(userId: string): Promise<void> {
	await lucia.invalidateUserSessions(userId);
}
