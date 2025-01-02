import { db } from '~backend/shared/db';
import { and, eq } from 'drizzle-orm';
import { userAuthTable } from '~backend/shared/db/schema/user-auth';
import { UserAuthType } from '~backend/auth/auth.entities';

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
}
