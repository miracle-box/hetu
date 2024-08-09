import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '~/db/connection';
import { sessionTable, userTable } from '~/db/schema/auth';
import { Static, t } from 'elysia';

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const sessionScopeSchema = t.Union([t.Literal('default'), t.Literal('yggdrasil')]);
export type SessionScope = Static<typeof sessionScopeSchema>;

export const lucia = new Lucia(adapter, {
	getSessionAttributes: (attributes) => {
		return {
			uid: attributes.uid,
			scope: attributes.scope,
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
		scope: 'default' | 'yggdrasil';
	}

	interface DatabaseUserAttributes {
		name: string;
		email: string;
	}
}
