'use server';

import { getClientAppConfig } from '../utils/app-config/client';

export async function getClientAppConfigAction() {
	return getClientAppConfig();
}
