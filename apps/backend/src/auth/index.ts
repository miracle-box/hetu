import { Lucia } from 'lucia';
import { adapter } from './adapter';

export const auth = new Lucia(adapter, {});

declare module 'lucia' {
	interface Register {
		Lucia: typeof auth;
	}
}
