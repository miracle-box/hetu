import type { IAuthRepository } from './auth.repository.interface';
import { and, eq, gt } from 'drizzle-orm';
import { Left, Right } from 'purify-ts';
import { DatabaseError } from '~backend/common/errors/base.error';
import { useDatabase } from '~backend/shared/db';
import { verificationsTable } from '~backend/shared/db/schema/verifications';
import { now } from '~backend/shared/db/sql';

export const AuthRepository: IAuthRepository = {
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
};
