import { createTransactionHelper } from '~backend/shared/db/transactions.ts';
import { drizzleClient } from './drizzle';

export const { withTransaction, useDatabase } = createTransactionHelper(drizzleClient);
