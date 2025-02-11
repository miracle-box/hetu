import { Elysia } from 'elysia';
import { serverTiming as serverTimingMiddleware } from '@elysiajs/server-timing';
export const serverTiming = (app: Elysia) =>
	app.use(
		serverTimingMiddleware({
			enabled: process.env.NODE_ENV !== 'production',
		}),
	);
