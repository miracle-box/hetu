import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { Config } from '#config';

import * as filesSchemas from '#db/schema/files';
import * as profilesSchemas from '#db/schema/profiles';
import * as sessionsSchemas from '#db/schema/sessions';
import * as texturesSchemas from '#db/schema/textures';
import * as userAuthSchemas from '#db/schema/user-auth';
import * as usersSchemas from '#db/schema/users';
import * as verificationsSchemas from '#db/schema/verifications';
import * as yggServerSessionsSchemas from '#db/schema/ygg-server-sessions';
import { PinoDrizzleLogger } from '#shared/db/logging';
import * as relations from '#shared/db/relations';

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
