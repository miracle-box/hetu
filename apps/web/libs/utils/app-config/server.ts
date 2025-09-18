import 'server-only';

import { buildClientAppConfig, type ClientAppConfig } from './client';

export type ServerAppConfig = {
	client: ClientAppConfig;

	jwtSecret: string;
	apiRoot: string;
};

function getServerAppConfig(): ServerAppConfig {
	return {
		client: buildClientAppConfig(),

		jwtSecret: process.env.JWT_SECRET,
		apiRoot: process.env.API_ROOT,
	};
}

export const ServerAppConfig = getServerAppConfig();
