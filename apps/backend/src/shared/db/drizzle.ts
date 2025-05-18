import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { Config } from '~backend/shared/config';
import { PinoDrizzleLogger } from '~backend/shared/db/logging.ts';

import * as relations from './relations';
import * as filesSchemas from './schema/files';
import * as profilesSchemas from './schema/profiles';
import * as sessionsSchemas from './schema/sessions';
import * as texturesSchemas from './schema/textures';
import * as userAuthSchemas from './schema/user-auth';
import * as usersSchemas from './schema/users';
import * as verificationsSchemas from './schema/verifications';
import * as yggServerSessionsSchemas from './schema/ygg-server-sessions';

const schema = {
	...filesSchemas,
	...profilesSchemas,
	...sessionsSchemas,
	...texturesSchemas,
	...userAuthSchemas,
	...usersSchemas,
	...verificationsSchemas,
	...yggServerSessionsSchemas,
	...relations,
};

const queryClient = postgres(Config.database.url, {});

export const drizzleClient = drizzle(queryClient, {
	schema,
	logger: Config.logging.logDatabaseQueries ? new PinoDrizzleLogger() : false,
});
