import type { IAuthRepository } from '#modules/auth/auth.repository.interface';
import { and, eq, gt } from 'drizzle-orm';
import { Left, Right } from 'purify-ts';
import { DatabaseError } from '#common/errors/base.error';
import { useDatabase } from '#db';
import { sessionsTable } from '#db/schema/sessions';
import { userAuthTable } from '#db/schema/user-auth';
import { usersTable } from '#db/schema/users';
import { verificationsTable } from '#db/schema/verifications';
import { UserAuthType } from '#modules/auth/auth.entities';
import { now } from '#shared/db/sql';

export const AuthRepository: IAuthRepository = {
	async getPassword(userId) {
		try {
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

			return Right(passwordRecord?.credential ?? null);
		} catch (e) {
			return Left(new DatabaseError('Failed to get password.', e));
		}
	},

	async upsertPassword(params) {
		try {
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

			return Right(undefined);
		} catch (e) {
			return Left(new DatabaseError('Failed to upsert password.', e));
		}
	},

	async createVerification(params) {
		try {
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
				throw new DatabaseError(
					'Failed to create verification.',
					'No verification record returned.',
				);
			}

			return Right(verifRecord);
		} catch (e) {
			return Left(new DatabaseError('Failed to create verification.', e));
		}
	},

	async revokeVerifications(params) {
		try {
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

			return Right(undefined);
		} catch (e) {
			return Left(new DatabaseError('Failed to revoke verifications.', e));
		}
	},

	async findVerificationById(id) {
		try {
			const db = useDatabase();

			// Checks are done in the application, so we don't need to filter here.
			const verification = await db.query.verificationsTable.findFirst({
				where: and(eq(verificationsTable.id, id)),
			});

			return Right(verification ?? null);
		} catch (e) {
			return Left(new DatabaseError('Failed to find verification by ID.', e));
		}
	},

	async findVerifiedVerification(id, scenario) {
		try {
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

			return Right(verification ?? null);
		} catch (e) {
			return Left(new DatabaseError('Failed to find verified verification.', e));
		}
	},

	async updateVerificationById(id, params) {
		try {
			const db = useDatabase();

			const [updatedVerification] = await db
				.update(verificationsTable)
				.set(params)
				.where(eq(verificationsTable.id, id))
				.returning();

			if (!updatedVerification) {
				throw new DatabaseError(
					'Failed to update verification by ID.',
					'No verification record returned.',
				);
			}

			return Right(updatedVerification);
		} catch (e) {
			return Left(new DatabaseError('Failed to update verification by ID.', e));
		}
	},

	async revokeVerificationById(id) {
		try {
			const db = useDatabase();

			await db
				.update(verificationsTable)
				.set({ expiresAt: now() })
				.where(eq(verificationsTable.id, id));

			return Right(undefined);
		} catch (e) {
			return Left(new DatabaseError('Failed to revoke verification by ID.', e));
		}
	},

	async findOAuth2Binding(provider, profileId) {
		try {
			const db = useDatabase();

			const authRecord = await db.query.userAuthTable.findFirst({
				where: and(
					eq(userAuthTable.provider, provider),
					eq(userAuthTable.credential, profileId),
					eq(userAuthTable.type, UserAuthType.OAUTH2),
				),
			});

			if (!authRecord) {
				return Right(null);
			}

			return Right({
				userId: authRecord.userId,
				provider: authRecord.provider,
				profileId: authRecord.credential,
			});
		} catch (e) {
			return Left(new DatabaseError('Failed to find OAuth2 binding.', e));
		}
	},

	async upsertOAuth2(params) {
		try {
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

			return Right(undefined);
		} catch (e) {
			return Left(new DatabaseError('Failed to upsert OAuth2 binding.', e));
		}
	},

	async findSessionById(sessionId) {
		try {
			const db = useDatabase();

			const session = await db.query.sessionsTable.findFirst({
				where: and(eq(sessionsTable.id, sessionId)),
			});

			return Right(session ?? null);
		} catch (e) {
			return Left(new DatabaseError('Failed to find session by ID.', e));
		}
	},

	async findSessionsByUser(userId) {
		try {
			const db = useDatabase();

			const sessions = await db.query.sessionsTable.findMany({
				where: and(eq(sessionsTable.userId, userId)),
			});

			return Right(sessions);
		} catch (e) {
			return Left(new DatabaseError('Failed to find sessions by user.', e));
		}
	},

	async revokeSessionById(sessionId) {
		try {
			const db = useDatabase();

			await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));

			return Right(undefined);
		} catch (e) {
			return Left(new DatabaseError('Failed to revoke session by ID.', e));
		}
	},

	async revokeSessionsByUser(userId) {
		try {
			const db = useDatabase();

			await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));

			return Right(undefined);
		} catch (e) {
			return Left(new DatabaseError('Failed to revoke sessions by user.', e));
		}
	},

	async createSession(params) {
		try {
			const db = useDatabase();

			const [createdSession] = await db
				.insert(sessionsTable)
				.values({
					userId: params.userId,
					metadata: params.metadata,
				})
				.returning();

			if (!createdSession) {
				throw new DatabaseError('Failed to create session.', 'No session record returned.');
			}

			return Right(createdSession);
		} catch (e) {
			return Left(new DatabaseError('Failed to create session.', e));
		}
	},

	async updateSession(sessionId, params) {
		try {
			const db = useDatabase();

			const [updatedSession] = await db
				.update(sessionsTable)
				.set({
					updatedAt: params.updatedAt,
				})
				.where(and(eq(sessionsTable.id, sessionId)))
				.returning();

			if (!updatedSession) {
				throw new DatabaseError('Failed to update session.', 'No session record returned.');
			}

			return Right(updatedSession);
		} catch (e) {
			return Left(new DatabaseError('Failed to update session.', e));
		}
	},

	async findUserWithPassword(email) {
		try {
			const db = useDatabase();

			const userWithAuthMethod = await db.query.usersTable.findFirst({
				columns: {
					id: true,
					email: true,
					name: true,
					createdAt: true,
					updatedAt: true,
				},
				where: eq(usersTable.email, email),
				with: {
					authMethods: {
						columns: {
							credential: true,
						},
						where: eq(userAuthTable.type, UserAuthType.PASSWORD),
					},
				},
			});

			if (!userWithAuthMethod || !userWithAuthMethod.authMethods[0]) {
				return Right(null);
			}

			return Right({
				id: userWithAuthMethod.id,
				email: userWithAuthMethod.email,
				name: userWithAuthMethod.name,
				createdAt: userWithAuthMethod.createdAt,
				updatedAt: userWithAuthMethod.updatedAt,
				passwordHash: userWithAuthMethod.authMethods[0].credential,
			});
		} catch (e) {
			return Left(new DatabaseError('Failed to find user with password.', e));
		}
	},
};
