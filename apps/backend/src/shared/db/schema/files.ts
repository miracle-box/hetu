import { bigint, pgEnum, pgTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const fileTypeEnum = pgEnum('file_type', ['texture_skin', 'texture_cape']);

export const filesTable = pgTable(
	'files',
	{
		id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
		hash: varchar('hash', { length: 64 }).notNull(),
		size: bigint('size', { mode: 'number' }).notNull(),
		type: fileTypeEnum('type').notNull(),
		mimeType: varchar('mime_type').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
	},
	(t) => ({
		// Files are unique in its type
		uniqueFileInType: uniqueIndex('unique_file_in_type').on(t.hash, t.type),
	}),
);
