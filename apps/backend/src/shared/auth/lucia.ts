import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '~backend/shared/db';
import { sessionsTable } from '~backend/shared/db/schema/sessions';
import { usersTable } from '~backend/shared/db/schema/users';
import { SessionMetadata, SessionScope } from '~backend/services/auth/session';

// @ts-ignore Lucia is going to be deprecated soon...
const adapter = new DrizzlePostgreSQLAdapter(db, sessionsTable, usersTable);

export const lucia = new Lucia(adapter, {
	getSessionAttributes: (attributes) => {
		return {
			uid: attributes.uid,
			scope: attributes.scope,
			metadata: attributes.metadata,
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
		scope: SessionScope;
		// Interfaces can not extend this, so we handle it in SessionService.
		metadata: SessionMetadata['metadata'];
	}

	interface DatabaseUserAttributes {
		name: string;
		email: string;
	}
}
