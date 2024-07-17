import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const queryClient = postgres(process.env.DATABASE_URL, {});

export const rawDb = queryClient;
export const db = drizzle(queryClient);
