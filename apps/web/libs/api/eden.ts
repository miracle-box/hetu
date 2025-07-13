import 'server-only';
import { createClient } from '@repo/api-client';

export const client = createClient(process.env.API_ROOT);
