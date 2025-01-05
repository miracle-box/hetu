import { db } from '~backend/shared/db';
import { and, eq, gt } from 'drizzle-orm';
import { userAuthTable } from '~backend/shared/db/schema/user-auth';
import { Session, SessionMetadata, UserAuthType } from '~backend/auth/auth.entities';
import { sessionsTable } from '~backend/shared/db/schema/sessions';
import { now } from '~backend/shared/db/utils';

export abstract class AuthRepository {
	static async getPassword(userId: string): Promise<string | null> {
		const passwordRecord = await db.query.userAuthTable.findFirst({
			columns: {
				credential: true,
			},
			where: and(
				eq(userAuthTable.userId, userId),
				eq(userAuthTable.type, UserAuthType.PASSWORD),
			),
		});

		return passwordRecord?.credential ?? null;
	}

	/**
	 * Update password record or create password when not exists.
	 *
	 * @param params Values for the password record
	 */
	static async upsertPassword(params: { userId: string; passwordHash: string }): Promise<void> {
		await db
			.insert(userAuthTable)
			.values({
				userId: params.userId,
				type: UserAuthType.PASSWORD,
				credential: params.passwordHash,
			})
			.onConflictDoUpdate({
				target: userAuthTable.userId,
				targetWhere: eq(userAuthTable.type, UserAuthType.PASSWORD),
				set: {
					credential: params.passwordHash,
				},
			});
	}

	static async findSessionById(sessionId: string): Promise<Session | null> {
		const session = await db.query.sessionsTable.findFirst({
			where: and(eq(sessionsTable.id, sessionId), gt(sessionsTable.expiresAt, now())),
		});

		return session ?? null;
	}

	static async findSessionsByUser(userId: string): Promise<Session[]> {
		return db.query.sessionsTable.findMany({
			where: and(eq(sessionsTable.userId, userId), gt(sessionsTable.expiresAt, now())),
		});
	}

	static async revokeSessionById(id: string): Promise<void> {
		await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
	}

	static async revokeSessionsByUser(userId: string): Promise<void> {
		await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
	}

	static async createSession(params: {
		userId: string;
		metadata: SessionMetadata;
		expiresAt: Date;
	}): Promise<Session> {
		const [createdSession] = await db
			.insert(sessionsTable)
			.values({
				userId: params.userId,
				metadata: params.metadata,
				expiresAt: params.expiresAt,
			})
			.returning();

		if (!createdSession) {
			throw new Error('Failed to create session.');
		}
		return createdSession;
	}

	static async renewSession(sessionId: string, expiresAt: Date): Promise<Session> {
		const [updatedSession] = await db
			.update(sessionsTable)
			.set({ expiresAt })
			.where(and(eq(sessionsTable.id, sessionId), gt(sessionsTable.expiresAt, now())))
			.returning();

		if (!updatedSession) {
			throw new Error('Failed to renew session.');
		}
		return updatedSession;
	}
}
