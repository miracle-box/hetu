'use server';

import { getClientAppConfig } from '../utils/app-config';

export async function getClientAppConfigAction() {
	return getClientAppConfig();
}
