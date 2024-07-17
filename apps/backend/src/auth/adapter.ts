import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '~/db/connection';
import { sessionTable, userTable } from '~/db/schema/auth';

export const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);
