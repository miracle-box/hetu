import { Static, t } from 'elysia';
import { UsersRepository } from '~backend/users/users.repository';
import { sessionSchema, SessionScope, SessionService } from '~backend/services/auth/session';
import { PasswordService } from '~backend/services/auth/password';

export const signinBodySchema = t.Object({
	email: t.String(),
	password: t.String(),
});
export const signinResponseSchema = t.Object({
	session: sessionSchema,
});

export async function signin(
	body: Static<typeof signinBodySchema>,
): Promise<Static<typeof signinResponseSchema>> {
	const user = await UsersRepository.findUserWithPassword(body.email);

	// [TODO] Consider add login limit to prevent possible attacks.
	if (!user) {
		throw new Error('Invalid credentials, or the user does not have password.');
	}

	const passwordCorrect = PasswordService.compare(body.password, user.passwordHash);
	if (!passwordCorrect) {
		throw new Error('Invalid credentials, or the user does not have password.');
	}

	const session = await SessionService.create(user.id, {
		scope: SessionScope.DEFAULT,
		metadata: {},
	});

	return { session };
}
