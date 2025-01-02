import { yggCredentialsSchema } from '~backend/yggdrasil/yggdrasil.entities';
import { Static, t } from 'elysia';
import { UsersRepository } from '~backend/users/users.repository';
import { PasswordService } from '~backend/services/auth/password';
import { SessionService } from '~backend/services/auth/session';

export const signoutBodySchema = yggCredentialsSchema;
export const signoutResponseSchema = t.Void();

export async function signout(
	body: Static<typeof signoutBodySchema>,
): Promise<Static<typeof signoutResponseSchema>> {
	// [TODO] Currently, this will invalidate all sessions of the user (not just Yggdrasil sessions).

	const user = await UsersRepository.findUserWithPassword(body.username);
	// [TODO] Consider add login limit to prevent possible attacks.
	if (!user) {
		throw new Error('Invalid credentials.');
	}

	const passwordCorrect = PasswordService.compare(user.passwordHash, body.password);
	if (!passwordCorrect) {
		throw new Error('Invalid credentials.');
	}

	await SessionService.revokeAll(user.id);
}
