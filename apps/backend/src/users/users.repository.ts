import { db } from '~backend/shared/db';
import { UserAuthType } from '~backend/auth/auth.entities';
import { TransactionRollbackError } from 'drizzle-orm/errors';
import { eq, or } from 'drizzle-orm';
import { usersTable } from '~backend/shared/db/schema/users';
import { userAuthTable } from '~backend/shared/db/schema/user-auth';
import { User } from '~backend/users/user.entities';

export abstract class UsersRepository {
	/**
	 * Check email address and username for existence.
	 *
	 * **You should call this before creating a user.**
	 *
	 * @param email Email
	 * @param name Username
	 */
	static async emailOrNameExists(email: string, name: string): Promise<boolean> {
		const existingUser = await db.query.usersTable.findFirst({
			columns: {
				id: true,
			},
			where: or(eq(usersTable.email, email), eq(usersTable.name, name)),
		});

		return !!existingUser;
	}

	/**
	 * Find user and password hash by email.
	 *
	 * @param email Email
	 */
	static async findUserWithPassword(email: string): Promise<
		| (User & {
				passwordHash: string;
		  })
		| null
	> {
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

	/**
	 * Create a user with password auth method.
	 *
	 * **You should check the name and email for existence before creating a user.**
	 *
	 * @param params User creation params.
	 */
	static async createWithPassword(params: {
		name: string;
		email: string;
		passwordHash: string;
	}): Promise<User> {
		try {
			const user = await db.transaction(async (tx) => {
				const [insertedUser] = await tx
					.insert(usersTable)
					.values({
						name: params.name,
						email: params.email,
					})
					.returning({
						id: usersTable.id,
						name: usersTable.name,
						email: usersTable.email,
					})
					.onConflictDoNothing();

				if (!insertedUser) {
					tx.rollback();
					return;
				}

				const [insertedAuth] = await tx
					.insert(userAuthTable)
					.values({
						type: UserAuthType.PASSWORD,
						userId: insertedUser.id,
						credential: params.passwordHash,
					})
					.returning();

				if (!insertedAuth) {
					tx.rollback();
					return;
				}

				return insertedUser;
			});

			if (!user) throw new Error('Failed to create user');
			return user;
		} catch (e) {
			if (e instanceof TransactionRollbackError) throw new Error('Failed to create user');
			throw e;
		}
	}

	static async findById(id: string): Promise<User | null> {
		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, id),
		});

		return user ?? null;
	}
}
