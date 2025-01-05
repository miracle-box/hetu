import { Static, t } from 'elysia';
import { AuthRepository } from '~backend/auth/auth.repository';
import { PasswordService } from '~backend/services/auth/password';
import { SessionService } from '~backend/services/auth/session';
import { sessionSchema, SessionScope } from '~backend/auth/auth.entities';

export const changePasswordBodySchema = t.Object({
	oldPassword: t.String(),
	newPassword: t.String({
		minLength: 8,
		maxLength: 120,
	}),
});
export const changePasswordResponseSchema = t.Object({
	session: sessionSchema,
});

export async function changePassword(
	body: Static<typeof changePasswordBodySchema>,
	userId: string,
): Promise<Static<typeof changePasswordResponseSchema>> {
	const oldPasswordHash = await AuthRepository.getPassword(userId);

	// If the user does not have a password, we set a password here.
	const oldPasswordCorrect = oldPasswordHash
		? await PasswordService.compare(body.oldPassword, oldPasswordHash)
		: true;
	if (!oldPasswordCorrect) {
		throw new Error('Invalid old password.');
	}

	const hashedNewPassword = await PasswordService.hash(body.newPassword);
	await AuthRepository.upsertPassword({ userId, passwordHash: hashedNewPassword });

	await SessionService.revokeAll(userId);
	const session = await SessionService.create(userId, {
		scope: SessionScope.DEFAULT,
	});

	return { session };
}
