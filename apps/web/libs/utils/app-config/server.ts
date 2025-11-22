import 'server-only';

import { getClientAppConfig, type ClientAppConfig } from './client';

export type ServerAppConfig = {
	client: ClientAppConfig;

	jwtSecret: string;
	apiRoot: string;
};

function getServerAppConfig(): ServerAppConfig {
	return {
		client: getClientAppConfig(),

		jwtSecret: process.env.JWT_SECRET,
		apiRoot: process.env.API_ROOT,
	};
}

export const ServerAppConfig = getServerAppConfig();
