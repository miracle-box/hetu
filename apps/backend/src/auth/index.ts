import { Lucia } from 'lucia';
import { adapter } from './adapter';

export const auth = new Lucia(adapter, {
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
		DatabaseUserAttributes: {
			name: string;
			email: string;
		};
	}
}
