import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { sql, SQL } from 'drizzle-orm';

export function lower(user: AnyPgColumn): SQL {
	return sql`lower(${user})`;
}

export function now(): SQL {
	return sql`NOW()`;
}
