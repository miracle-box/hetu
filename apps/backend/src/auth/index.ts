import { Lucia } from 'lucia';
import { adapter } from './adapter';

export const auth = new Lucia(adapter, {
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
		Lucia: typeof auth;
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
