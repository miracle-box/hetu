import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Config } from '~backend/shared/config';

import * as filesSchemas from './schema/files';
import * as profilesSchemas from './schema/profiles';
import * as sessionsSchemas from './schema/sessions';
import * as texturesSchemas from './schema/textures';
import * as userAuthSchemas from './schema/user-auth';
import * as usersSchemas from './schema/users';
import * as verificationsSchemas from './schema/verifications';
import * as yggServerSessionsSchemas from './schema/ygg-server-sessions';
import * as relations from './relations';

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

export const rawDb = queryClient;
export const db = drizzle(queryClient, { schema });
