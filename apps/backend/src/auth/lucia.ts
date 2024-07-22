import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '~/db/connection';
import { sessionTable, userTable } from '~/db/schema/auth';

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
	getSessionAttributes: (attributes) => {
		return {
			uid: attributes.uid,
		};
	},
	getUserAttributes: (attributes) => {
		return {
			name: attributes.name,
			email: attributes.email,
		};
	},
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseSessionAttributes: DatabaseSessionAttributes;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}

	interface DatabaseSessionAttributes {
		uid: string;
	}

	interface DatabaseUserAttributes {
		name: string;
		email: string;
	}
}
