import { Lucia } from 'lucia';
import { adapter } from './adapter';

export const auth = new Lucia(adapter, {
	getSessionAttributes: (attributes) => {
		return {
			sessionUid: attributes.uid,
		};
	},
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof auth;
		DatabaseSessionAttributes: DatabaseSessionAttributes;
	}

	interface DatabaseSessionAttributes {
		uid: string;
	}
}
