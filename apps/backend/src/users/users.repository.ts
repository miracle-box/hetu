import type { User } from '~backend/users/user.entities';
import { eq, or } from 'drizzle-orm';
import { UserAuthType } from '~backend/modules/auth/auth.entities';
import { useDatabase } from '~backend/shared/db';
import { userAuthTable } from '~backend/shared/db/schema/user-auth';
import { usersTable } from '~backend/shared/db/schema/users';

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
		const db = useDatabase();

		const existingUser = await db.query.usersTable.findFirst({
			columns: {
				id: true,
			},
			where: or(eq(usersTable.email, email), eq(usersTable.name, name)),
		});

		return !!existingUser;
	}

	/**
	 * Find user by email.
	 *
	 * @param email Email
	 */
	static async findByEmail(email: string): Promise<User | null> {
		const db = useDatabase();

		const user = await db.query.usersTable.findFirst({
			columns: {
				id: true,
				email: true,
				name: true,
			},
			where: eq(usersTable.email, email),
		});

		if (!user) return null;

		return {
			id: user.id,
			email: user.email,
			name: user.name,
		};
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

	/**
	 * Create a user.
	 * @param params user info
	 */
	static async insertUser(params: { name: string; email: string }) {
		const db = useDatabase();

		const [insertedUser] = await db
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

		return insertedUser ?? null;
	}

	static async findById(id: string): Promise<User | null> {
		const db = useDatabase();

		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, id),
		});

		return user ?? null;
	}
}
