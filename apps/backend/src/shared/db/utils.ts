import { sql, SQL } from 'drizzle-orm';
import { AnyPgColumn } from 'drizzle-orm/pg-core';

export function lower(user: AnyPgColumn): SQL {
	return sql`lower(${user})`;
}

export function now(): SQL {
	return sql`NOW()`;
}
