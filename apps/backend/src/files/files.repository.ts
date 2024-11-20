import { createSelectSchema } from 'drizzle-typebox';
import { filesTable } from '~/shared/db/schema/files';
import { Static } from 'elysia';
import { db } from '~/shared/db';
import { FileType } from '~/files/files.entities';
import { and, eq } from 'drizzle-orm';

const fileRecordSchema = createSelectSchema(filesTable, {});

type FileRecord = Static<typeof fileRecordSchema>;

export abstract class FilesRepository {
	static async create(
		params: Pick<FileRecord, 'hash' | 'size' | 'type' | 'mimeType'>,
	): Promise<FileRecord> {
		const [fileRecord] = await db.insert(filesTable).values(params).returning();

		if (!fileRecord) throw new Error('Failed to create file record.');
		return fileRecord;
	}

	static async findByHash(hash: string, type: FileType): Promise<FileRecord | null> {
		const fileRecord = await db.query.filesTable.findFirst({
			where: and(eq(filesTable.hash, hash), eq(filesTable.type, type)),
		});

		return fileRecord ?? null;
	}

	/**
	 * Find file by its ID and optionally limit its type.
	 *
	 * @param id File ID
	 * @param type File type (optional)
	 */
	static async findById(id: string, type?: FileType): Promise<FileRecord | null> {
		const fileRecord = await db.query.filesTable.findFirst({
			where: type
				? and(eq(filesTable.id, id), eq(filesTable.type, type))
				: eq(filesTable.id, id),
		});

		return fileRecord ?? null;
	}
}
