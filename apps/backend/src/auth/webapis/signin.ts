import { Static, t } from 'elysia';
import { UsersRepository } from '~backend/users/users.repository';
import { SessionService } from '~backend/services/auth/session';
import { PasswordService } from '~backend/services/auth/password';
import { Session, sessionSchema, SessionScope } from '~backend/auth/auth.entities';

export const signinBodySchema = t.Object({
	email: t.String(),
	password: t.String(),
});
export const signinResponseSchema = t.Object({
	session: sessionSchema(t.Literal(SessionScope.DEFAULT)),
});

export async function signin(
	body: Static<typeof signinBodySchema>,
): Promise<Static<typeof signinResponseSchema>> {
	const user = await UsersRepository.findUserWithPassword(body.email);

	// [TODO] Consider add login limit to prevent possible attacks.
	if (!user) {
		throw new Error('Invalid credentials.');
	}

	const passwordCorrect = await PasswordService.compare(body.password, user.passwordHash);
	if (!passwordCorrect) {
		throw new Error('Invalid credentials.');
	}

	const session = (await SessionService.create(user.id, {
		scope: SessionScope.DEFAULT,
	})) as Session<typeof SessionScope.DEFAULT>;

	return { session };
}
