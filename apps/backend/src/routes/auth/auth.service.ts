import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { lucia, SessionScope } from '~/auth/lucia';
import { db } from '~/db/connection';
import { userAuthTable, userTable } from '~/db/schema/auth';
import { Session, SessionMetadata, SessionSummary } from '~/models/session';
import { SigninRequest, SignupRequest } from './auth.model';

export abstract class AuthService {
	static async signup(body: SignupRequest): Promise<Session> {
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

	/**
	 * Sign in a user
	 * @todo [TODO] Use `credentialsSignin` for actual signin logic.
	 * @param body username and password
	 * @returns session data
	 */
	static async signin(body: SigninRequest): Promise<Session> {
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

		const session = await lucia.createSession(
			user.id,
			{
				uid: createId(),
				// [TODO] Support signing other scopes
				scope: 'default',
				metadata: {},
			},
			{ sessionId: createId() },
		);

		return session;
	}

	static async refresh(session: Session): Promise<Session> {
		await lucia.invalidateSession(session.id);
		const newSession = await lucia.createSession(
			session.userId,
			{
				uid: createId(),
				scope: session.scope,
				metadata: session.metadata,
			},
			{ sessionId: createId() },
		);

		return newSession;
	}

	static async credentialsSignin(
		email: string,
		password: string,
		scope: SessionScope,
		metadata: SessionMetadata,
	): Promise<Session> {
		// Find user by email, then join password hash.
		const [user] = await db
			.select({
				id: userTable.id,
				email: userTable.email,
				passwordHash: userAuthTable.credential,
			})
			.from(userTable)
			.where(eq(userTable.email, email))
			.innerJoin(userAuthTable, eq(userTable.id, userAuthTable.userId))
			.limit(1);

		// [TODO] Early returns can indicate whether the email is valid, consider add login limit
		if (!user) {
			// [TODO] Manage all errors in one place
			throw new Error('Invalid email or password.');
		}

		const passwordCorrect = await Bun.password.verify(password, user.passwordHash);
		// [TODO] Manage all errors in one place
		if (!passwordCorrect) throw new Error('Invalid email or password.');

		const session = await lucia.createSession(
			user.id,
			{
				uid: createId(),
				scope,
				metadata,
			},
			{ sessionId: createId() },
		);

		return session;
	}

	static async getUserSessionSummaries(userId: string): Promise<SessionSummary[]> {
		const sessions = await lucia.getUserSessions(userId);
		return sessions.map((session) => session);
	}

	static async getSessionSummary(userId: string, uid: string): Promise<SessionSummary | null> {
		return (
			(await this.getUserSessionSummaries(userId)).find((session) => uid === session.uid) ??
			null
		);
	}

	static async revokeUserSessions(userId: string): Promise<void> {
		await lucia.invalidateUserSessions(userId);
	}

	static async revokeSession(userId: string, uid: string): Promise<void> {
		const allSessions = await lucia.getUserSessions(userId);
		const targetSession = allSessions.find((session) => uid === session.uid);

		if (targetSession) await lucia.invalidateSession(targetSession.id);
	}
}
