import { serverTiming as serverTimingMiddleware } from '@elysiajs/server-timing';
import { Elysia } from 'elysia';
import { Config } from '~backend/shared/config';
export const serverTiming = (app: Elysia) =>
	app.use(
		serverTimingMiddleware({
			enabled: Config.debug.enableServerTiming,
		}),
	);
