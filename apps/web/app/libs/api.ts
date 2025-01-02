import { treaty } from '@elysiajs/eden';
import type { App } from '@repo/backend';

export const client: ReturnType<typeof treaty<App>> = treaty<App>(process.env.API_ROOT);
