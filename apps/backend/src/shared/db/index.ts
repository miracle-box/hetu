import { drizzleClient } from '#shared/db/drizzle';
import { createTransactionHelper } from '#shared/db/transactions';

export const { withTransaction, useDatabase } = createTransactionHelper(drizzleClient);
