import 'server-only';
import type { App } from '@repo/backend/app';
import { treaty } from '@elysiajs/eden';

export const client = treaty<App>(process.env.API_ROOT);
