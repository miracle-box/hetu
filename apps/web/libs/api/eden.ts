import 'server-only';
import { createClient } from '@repo/api-client';
import { ServerAppConfig } from '../utils/app-config/server';

export const client = createClient(ServerAppConfig.apiRoot);
