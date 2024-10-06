import { and, eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { lucia, SessionScope } from '~/auth/lucia';
import { db } from '~/db/connection';
import { userAuthTable, userTable, verificationTable } from '~/db/schema/auth';
import { Session, SessionMetadata, SessionSummary } from '~/models/session';
import { SigninRequest, SignupRequest } from './auth.model';
import { VerificationMetadata, VerificationSummary } from '~/models/auth';
import { mailer } from '~/mailing/mailing';

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
	 *
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
		return sessions.map(({ uid, scope, userId, metadata, expiresAt }) => ({
			uid,
			scope,
			userId,
			metadata,
			expiresAt,
		}));
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

	/**
	 * @todo [TODO] Refactor this at sometime.
	 */
	static async changePassword(
		userId: string,
		oldPassword: string,
		newpassword: string,
	): Promise<Session> {
		const [dbPassword] = await db
			.select({ hash: userAuthTable.credential })
			.from(userAuthTable)
			.where(and(eq(userAuthTable.userId, userId), eq(userAuthTable.type, 'password')))
			.limit(1);

		const oldPasswordCorrect = dbPassword?.hash
			? await Bun.password.verify(oldPassword, dbPassword.hash)
			: true;

		if (!oldPasswordCorrect) {
			// [TODO] Manage all errors in one place
			throw new Error('Invalid old password.');
		}

		const hashedNewPassword = await Bun.password.hash(newpassword);
		// Update or insert new password
		dbPassword
			? await db
					.update(userAuthTable)
					.set({ credential: hashedNewPassword })
					.where(
						and(eq(userAuthTable.userId, userId), eq(userAuthTable.type, 'password')),
					)
					.returning()
			: await db
					.insert(userAuthTable)
					.values({
						userId: userId,
						type: 'password',
						credential: hashedNewPassword,
					})
					.returning();

		await lucia.invalidateUserSessions(userId);

		const [user] = await db
			.select({ email: userTable.email })
			.from(userTable)
			.where(eq(userTable.id, userId))
			.limit(1);

		if (!user) {
			// [TODO] Manage all errors in one place
			throw new Error('Failed to get user.');
		}

		return this.credentialsSignin(user.email, newpassword, 'default', {});
	}

	// [TODO] Support more verification methods
	static async createEmailVerification(
		email: string,
		metadata: VerificationMetadata,
	): Promise<VerificationSummary> {
		const [user] = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);

		const [record] = await db
			.insert(verificationTable)
			.values({
				userId: user?.id,
				secret: createId(),
				method: 'email',
				metadata: metadata,
				// 30 minutes
				expiresAt: new Date(Date.now() + 1000 * 60 * 30),
			})
			.returning();

		if (!record) {
			throw new Error('Failed to create verification record.');
		}

		// Only send email if user exists, but always record verifications
		if (user) {
			await new Promise((resolve, reject) => {
				mailer.sendMail(
					{
						from: process.env.MAIL_SMTP_FROM,
						to: user.email,
						subject: 'Email verification',
						text: `Email verification
Action: ${record.metadata.action}
Verify using this code: ${record.secret}
The verification code will be expired after ${record.expiresAt}.
Verification request ID: ${record.id}
`,
					},
					function (error, info) {
						if (error) {
							reject(false);
						} else {
							resolve(true);
						}
					},
				);
			});
		}

		return {
			id: record.id,
			method: record.method,
			action: record.metadata.action,
			expiresAt: record.expiresAt,
		};
	}

	static async createResetPasswordVerification(email: string): Promise<VerificationSummary> {
		return this.createEmailVerification(email, {
			action: 'password-reset',
		});
	}

	static async resetPassword(
		verificationId: string,
		verificationSecret: string,
		newPassword: string,
	): Promise<void> {
		const [record] = await db
			.select()
			.from(verificationTable)
			.where(eq(verificationTable.id, verificationId))
			.limit(1);
		if (!record || !record.userId) {
			// [TODO] Manage all errors in one place
			throw new Error('Verification not found.');
		}
		if (record.expiresAt < new Date()) {
			// [TODO] Manage all errors in one place
			throw new Error('Verification expired.');
		}
		if (record.secret !== verificationSecret) {
			// [TODO] Manage all errors in one place
			throw new Error('Invalid verification secret.');
		}

		// Remove the verification record
		await db.delete(verificationTable).where(eq(verificationTable.id, verificationId));

		const passwordHash = await Bun.password.hash(newPassword, {
			algorithm: 'argon2id',
			timeCost: 2,
			memoryCost: 19456,
		});
		const [authRecord] = await db
			.update(userAuthTable)
			.set({ credential: passwordHash })
			.where(and(eq(userAuthTable.userId, record.userId), eq(userAuthTable.type, 'password')))
			.returning();
		if (!authRecord) {
			// [TODO] Manage all errors in one place
			throw new Error('Failed to reset password.');
		}

		await lucia.invalidateUserSessions(record.userId);
	}
}
