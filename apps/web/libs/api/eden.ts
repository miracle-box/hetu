import 'server-only';
import { treaty } from '@elysiajs/eden';
import type { App } from '~backend/index';

export const client: ReturnType<typeof treaty<App>> = treaty<App>(process.env.API_ROOT);
