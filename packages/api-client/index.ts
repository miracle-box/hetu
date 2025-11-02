// Eden
import { treaty } from '@elysiajs/eden';
import { app } from '@repo/backend/app';
export type App = typeof app;
export const createClient = (
	domain: Parameters<typeof treaty<App>>[0],
	config?: Parameters<typeof treaty<App>>[1],
) => treaty<App>(domain, config);

// Types
export * from './types';
