import type { User } from '~backend/modules/users/users.entities';
import { eq } from 'drizzle-orm';
import { UserAuthType } from '~backend/modules/auth/auth.entities';
import { useDatabase } from '~backend/shared/db';
import { userAuthTable } from '~backend/shared/db/schema/user-auth';
import { usersTable } from '~backend/shared/db/schema/users';

/**
 * @deprecated
 */
export abstract class UsersRepository {
	/**
	 * Find user and password hash by email.
	 *
	 * @param email Email
	 */
	static async findUserWithPassword(email: string): Promise<
		| (Omit<User, 'createdAt' | 'updatedAt'> & {
				passwordHash: string;
		  })
		| null
	> {
		const db = useDatabase();

		const userWithAuthMethod = await db.query.usersTable.findFirst({
			columns: {
				id: true,
				email: true,
				name: true,
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

		if (!userWithAuthMethod || !userWithAuthMethod.authMethods[0]) return null;

		return {
			id: userWithAuthMethod.id,
			email: userWithAuthMethod.email,
			name: userWithAuthMethod.name,
			passwordHash: userWithAuthMethod.authMethods[0].credential,
		};
	}

	static async findById(id: string): Promise<User | null> {
		const db = useDatabase();

		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, id),
		});

		return user ?? null;
	}
}
