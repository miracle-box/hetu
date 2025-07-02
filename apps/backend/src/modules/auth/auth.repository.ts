import type { IAuthRepository } from './auth.repository.interface';
import { and, eq, gt } from 'drizzle-orm';
import { Left, Right } from 'purify-ts';
import { DatabaseError } from '~backend/common/errors/base.error';
import { useDatabase } from '~backend/shared/db';
import { userAuthTable } from '~backend/shared/db/schema/user-auth';
import { verificationsTable } from '~backend/shared/db/schema/verifications';
import { now } from '~backend/shared/db/sql';
import { UserAuthType } from './auth.entities';

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
};
