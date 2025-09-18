'use server';

import { buildClientAppConfig } from '../utils/app-config/client';

export async function getClientAppConfigAction() {
	return buildClientAppConfig();
}
