import { db } from '~/db/connection';
import { AuthSigninRequest, AuthSigninResponse, AuthSignupRequest } from './auth.model';
import { userTable } from '~/db/schema/auth';
import { eq } from 'drizzle-orm';
import { auth } from '~/auth';
import { createId } from '@paralleldrive/cuid2';

export abstract class AuthService {
	static async create(body: AuthSignupRequest): Promise<AuthSigninResponse> {
		// From OWASP Cheatsheet recommendations
		const passwordHash = await Bun.password.hash(body.password, {
			algorithm: 'argon2id',
			timeCost: 2,
			memoryCost: 19456,
		});

		const insertedUser = await db
			.insert(userTable)
			.values({
				name: body.name,
				email: body.email,
				passwordHash,
			})
			.returning({
				insertedId: userTable.id,
			})
			.onConflictDoNothing();

		// [TODO] Manage all errors in one place
		if (insertedUser.length <= 0) throw new Error('User exists');

		return this.signin({
			email: body.email,
			password: body.password,
		});
	}

	static async signin(body: AuthSigninRequest): Promise<AuthSigninResponse> {
		// Find first user by email
		const [user] = await db
			.select({
				id: userTable.id,
				email: userTable.email,
				passwordHash: userTable.passwordHash,
			})
			.from(userTable)
			.where(eq(userTable.email, body.email))
			.limit(1);

		// [TODO] Early returns can indicate whether the email is valid, consider add login limit
		if (!user) {
			// [TODO] Manage all errors in one place
			throw new Error('Invalid email or password.');
		}

		const passwordCorrect = await Bun.password.verify(body.password, user.passwordHash);
		// [TODO] Manage all errors in one place
		if (!passwordCorrect) throw new Error('Invalid email or password.');

		const session = await auth.createSession(
			user.id,
			{
				name: user.email,
				email: user.email,
			},
			{
				sessionId: createId(),
			},
		);

		return {
			sessionId: session.id,
			expiresAt: session.expiresAt,
		};
	}
}
