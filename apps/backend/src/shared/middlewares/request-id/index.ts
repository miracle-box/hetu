import { createId } from '@paralleldrive/cuid2';
import Elysia from 'elysia';

const HEADER_KEY = 'X-Request-ID';

export const requestId = new Elysia({ name: 'RequestId' })
	.onRequest(({ set, request: { headers } }) => {
		set.headers[HEADER_KEY] = headers.get(HEADER_KEY) ?? createId();
	})
	.derive(({ set }) => {
		return {
			requestID: set.headers[HEADER_KEY],
		};
	});
