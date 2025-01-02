import { filesTable } from '~backend/shared/db/schema/files';
import { db } from '~backend/shared/db';
import { FileInfo, FileType } from '~backend/files/files.entities';
import { and, eq } from 'drizzle-orm';

export abstract class FilesRepository {
	static async create(
		params: Pick<FileInfo, 'hash' | 'size' | 'type' | 'mimeType'>,
	): Promise<FileInfo> {
		const [fileRecord] = await db.insert(filesTable).values(params).returning();

		if (!fileRecord) throw new Error('Failed to create file record.');
		return fileRecord;
	}

	static async findByHash(hash: string, type: FileType): Promise<FileInfo | null> {
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
	static async findById(id: string, type?: FileType): Promise<FileInfo | null> {
		const fileRecord = await db.query.filesTable.findFirst({
			where: type
				? and(eq(filesTable.id, id), eq(filesTable.type, type))
				: eq(filesTable.id, id),
		});

		return fileRecord ?? null;
	}
}
