import { SessionService } from '~backend/services/auth/session';

export async function revokeAllSessions(userId: string): Promise<void> {
	await SessionService.revokeAll(userId);
}
