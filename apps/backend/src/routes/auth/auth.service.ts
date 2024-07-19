import { db } from '~/db/connection';
import { AuthSigninRequest, AuthSigninResponse, AuthSignupRequest } from './auth.model';
import { userAuthTable, userTable } from '~/db/schema/auth';
import { and, eq } from 'drizzle-orm';
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

		const insertedUser = await db.transaction(async (tx) => {
			const [txInsertedUser] = await tx
				.insert(userTable)
				.values({
					name: body.name,
					email: body.email,
				})
				.returning({
					id: userTable.id,
				})
				.onConflictDoNothing();

			if (!txInsertedUser) {
				throw new Error('User exists');
			}

			const [txInsertedAuth] = await tx
				.insert(userAuthTable)
				.values({
					type: 'password',
					userId: txInsertedUser.id,
					credential: passwordHash,
				})
				.onConflictDoUpdate({
					target: [userAuthTable.userId, userAuthTable.type],
					targetWhere: eq(userAuthTable.type, 'password'),
					set: { credential: passwordHash },
				})
				.returning({
					id: userAuthTable.id,
				});

			if (!txInsertedAuth) {
				throw new Error('Failed to create user auth');
			}

			return txInsertedUser;
		});

		// [TODO] Manage all errors in one place
		if (!insertedUser) throw new Error('User exists');

		return this.signin({
			email: body.email,
			password: body.password,
		});
	}

	static async signin(body: AuthSigninRequest): Promise<AuthSigninResponse> {
		// Find user by email, then join password hash.
		const [user] = await db
			.select({
				id: userTable.id,
				email: userTable.email,
				passwordHash: userAuthTable.credential,
			})
			.from(userTable)
			.where(eq(userTable.email, body.email))
			.innerJoin(userAuthTable, eq(userTable.id, userAuthTable.userId))
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
			{},
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
