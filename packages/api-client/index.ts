// API types and schemas
export * from './types';

// Errors
export { ApiErrors } from './generated/shared/errors';

// Eden
import { treaty } from '@elysiajs/eden';
import { app } from '@repo/backend/app';
export type App = typeof app;
export const createClient = (
	domain: Parameters<typeof treaty<App>>[0],
	config?: Parameters<typeof treaty<App>>[1],
) => treaty<App>(domain, config);
