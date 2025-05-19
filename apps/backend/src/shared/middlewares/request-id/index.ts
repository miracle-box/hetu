import { AsyncLocalStorage } from 'node:async_hooks';
import { createId } from '@paralleldrive/cuid2';
import Elysia from 'elysia';

const HEADER_KEY = 'X-Request-ID';

// [TODO] This probably should be moved outside of this middleware.
export const requestIdStore = new AsyncLocalStorage<string>();

export const requestId = new Elysia({ name: 'RequestId' })
	.onRequest(({ set, request: { headers } }) => {
		const requestId = headers.get(HEADER_KEY) ?? createId();
		set.headers[HEADER_KEY] = requestId;
		requestIdStore.enterWith(requestId);
	})
	.derive(({ set }) => {
		return {
			requestID: set.headers[HEADER_KEY],
		};
	});
