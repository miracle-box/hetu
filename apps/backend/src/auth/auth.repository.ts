import type {
	OAuthAuth,
	Session,
	SessionMetadata,
	Verification,
	VerificationScenario,
	VerificationType,
} from '~backend/auth/auth.entities';
import { and, eq, gt } from 'drizzle-orm';
import { UserAuthType } from '~backend/auth/auth.entities';
import { useDatabase } from '~backend/shared/db';
import { sessionsTable } from '~backend/shared/db/schema/sessions';
import { userAuthTable } from '~backend/shared/db/schema/user-auth';
import { verificationsTable } from '~backend/shared/db/schema/verifications';
import { now } from '~backend/shared/db/sql';

export abstract class AuthRepository {
	static async getPassword(userId: string): Promise<string | null> {
		const db = useDatabase();

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
		const db = useDatabase();

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

	static async upsertOAuth2(params: {
		userId: string;
		provider: string;
		oauth2ProfileId: string;
		metadata: OAuthAuth['metadata'];
	}): Promise<void> {
		const db = useDatabase();

		await db
			.insert(userAuthTable)
			.values({
				userId: params.userId,
				type: UserAuthType.OAUTH2,
				provider: params.provider,
				credential: params.oauth2ProfileId,
				metadata: params.metadata,
			})
			.onConflictDoUpdate({
				target: [userAuthTable.userId, userAuthTable.provider],
				targetWhere: and(
					eq(userAuthTable.type, UserAuthType.OAUTH2),
					eq(userAuthTable.provider, params.provider),
				),
				set: {
					credential: params.oauth2ProfileId,
					metadata: params.metadata,
				},
			});
	}

	static async findOAuth2Binding(provider: string, profileId: string) {
		const db = useDatabase();

		const authRecord = await db.query.userAuthTable.findFirst({
			where: and(
				eq(userAuthTable.provider, provider),
				eq(userAuthTable.credential, profileId),
			),
		});

		return authRecord ?? null;
	}

	static async findSessionById(sessionId: string): Promise<Session | null> {
		const db = useDatabase();

		const session = await db.query.sessionsTable.findFirst({
			where: and(eq(sessionsTable.id, sessionId)),
		});

		return session ?? null;
	}

	static async findSessionsByUser(userId: string): Promise<Session[]> {
		const db = useDatabase();

		return db.query.sessionsTable.findMany({
			where: and(eq(sessionsTable.userId, userId)),
		});
	}

	static async revokeSessionById(id: string): Promise<void> {
		const db = useDatabase();

		await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
	}

	static async revokeSessionsByUser(userId: string): Promise<void> {
		const db = useDatabase();

		await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
	}

	static async createSession(params: {
		userId: string;
		metadata: SessionMetadata;
	}): Promise<Session> {
		const db = useDatabase();

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
		const db = useDatabase();

		const [updatedSession] = await db
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
		const db = useDatabase();

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
	 * Revoke verifications for a specific target in a scenario.
	 *
	 * ! Do not use this for OAuth verifications, their `target` only indicates the provider!
	 *
	 * @param params
	 */
	static async revokeVerifications(params: { scenario: VerificationScenario; target: string }) {
		const db = useDatabase();

		await db
			.update(verificationsTable)
			.set({ expiresAt: now() })
			.where(
				and(
					eq(verificationsTable.target, params.target),
					eq(verificationsTable.scenario, params.scenario),
					gt(verificationsTable.expiresAt, now()),
				),
			);
	}

	static async findVerificationById(id: string): Promise<Verification | null> {
		const db = useDatabase();

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
		const db = useDatabase();

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
		const db = useDatabase();

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
		const db = useDatabase();

		await db
			.update(verificationsTable)
			.set({ expiresAt: now() })
			.where(eq(verificationsTable.id, id));
	}
}
