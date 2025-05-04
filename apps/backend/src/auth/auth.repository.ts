import type {
	Session,
	SessionMetadata,
	Verification,
	VerificationScenario,
	VerificationType,
} from '~backend/auth/auth.entities';
import { and, eq, gt, TransactionRollbackError } from 'drizzle-orm';
import { SessionLifecycle, UserAuthType } from '~backend/auth/auth.entities';
import { getLifecycle } from '~backend/shared/auth/utils';
import { db } from '~backend/shared/db';
import { sessionsTable } from '~backend/shared/db/schema/sessions';
import { userAuthTable } from '~backend/shared/db/schema/user-auth';
import { verificationsTable } from '~backend/shared/db/schema/verifications';
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
			where: and(eq(sessionsTable.id, sessionId)),
		});

		return session ?? null;
	}

	static async findSessionsByUser(userId: string): Promise<Session[]> {
		return db.query.sessionsTable.findMany({
			where: and(eq(sessionsTable.userId, userId)),
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
	}): Promise<Session> {
		const [createdSession] = await db
			.insert(sessionsTable)
			.values({
				userId: params.userId,
				metadata: params.metadata,
			})
			.returning();

		if (!createdSession) {
			throw new Error('Failed to create session.');
		}
		return createdSession;
	}

	static async updateSession(
		sessionId: string,
		params: {
			updatedAt: Date;
		},
	): Promise<Session> {
		try {
			return await db.transaction(async (tx) => {
				const session = await tx.query.sessionsTable.findFirst({
					where: and(eq(sessionsTable.id, sessionId)),
				});

				const lifecycle = getLifecycle(session);
				// [TODO] Not suitable to do the check here, let's rewrite later.
				if (
					lifecycle === SessionLifecycle.RefreshOnly ||
					lifecycle === SessionLifecycle.Expired
				) {
					throw new Error('Session is not active and can not be renewed.');
				}

				const [updatedSession] = await tx
					.update(sessionsTable)
					.set({
						updatedAt: params.updatedAt,
					})
					.where(and(eq(sessionsTable.id, sessionId)))
					.returning();

				if (!updatedSession) {
					throw new Error('Failed to update session.');
				}

				return updatedSession;
			});
		} catch (e) {
			if (e instanceof TransactionRollbackError) {
				throw new Error('Failed to update session.');
			}

			throw e;
		}
	}

	static async createVerification(params: {
		userId?: string;
		type: VerificationType;
		scenario: VerificationScenario;
		target: string;
		secret: string;
		verified: boolean;
		triesLeft: number;
		expiresAt: Date;
	}): Promise<Verification> {
		const [verifRecord] = await db
			.insert(verificationsTable)
			.values({
				userId: params.userId,
				type: params.type,
				scenario: params.scenario,
				target: params.target,
				secret: params.secret,
				verified: params.verified,
				triesLeft: params.triesLeft,
				expiresAt: params.expiresAt,
			})
			.returning();

		if (!verifRecord) {
			throw new Error('Failed to create verification.');
		}

		return verifRecord;
	}

	/**
	 * Create a new verification and revoke any existing records.
	 *
	 * @todo [FIXME] This should be split into separate functions!
	 * @param params Verification params
	 * @returns Created verification
	 */
	static async createOnlyVerification(params: {
		userId?: string;
		type: VerificationType;
		scenario: VerificationScenario;
		target: string;
		secret: string;
		verified: boolean;
		triesLeft: number;
		expiresAt: Date;
	}): Promise<Verification> {
		try {
			const verif = await db.transaction(async (tx) => {
				// Revoke any existing verification for the target
				await tx
					.update(verificationsTable)
					.set({ expiresAt: now() })
					.where(
						and(
							eq(verificationsTable.target, params.target),
							gt(verificationsTable.expiresAt, now()),
						),
					);

				const [verifRecord] = await tx
					.insert(verificationsTable)
					.values({
						userId: params.userId,
						type: params.type,
						scenario: params.scenario,
						target: params.target,
						secret: params.secret,
						verified: params.verified,
						triesLeft: params.triesLeft,
						expiresAt: params.expiresAt,
					})
					.returning();

				return verifRecord;
			});

			if (!verif) {
				throw new Error('Failed to create verification.');
			}
			return verif;
		} catch (e) {
			if (e instanceof TransactionRollbackError)
				throw new Error('Failed to create verification');
			throw e;
		}
	}

	static async findVerificationById(id: string): Promise<Verification | null> {
		// Checks are done in the application, so we don't need to filter here.
		const verification = await db.query.verificationsTable.findFirst({
			where: and(eq(verificationsTable.id, id)),
		});

		return verification ?? null;
	}

	static async findVerifiedVerification(
		id: string,
		scenario: VerificationScenario,
	): Promise<Verification | null> {
		const verification = await db.query.verificationsTable.findFirst({
			where: and(
				eq(verificationsTable.id, id),
				eq(verificationsTable.scenario, scenario),
				gt(verificationsTable.expiresAt, now()),
				gt(verificationsTable.triesLeft, 0),
				eq(verificationsTable.verified, true),
			),
		});

		return verification ?? null;
	}

	static async updateVerificationById(
		id: string,
		params: {
			verified?: boolean;
			triesLeft?: number;
			secret?: string;
			expiresAt?: Date;
		},
	): Promise<Verification> {
		const [updatedVerification] = await db
			.update(verificationsTable)
			.set(params)
			.where(eq(verificationsTable.id, id))
			.returning();

		if (!updatedVerification) {
			throw new Error('Failed to update verification.');
		}
		return updatedVerification;
	}

	static async revokeVerificationById(id: string): Promise<void> {
		await db
			.update(verificationsTable)
			.set({ expiresAt: now() })
			.where(eq(verificationsTable.id, id));
	}
}
