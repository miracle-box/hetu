import type { FileInfo } from './files.entities';
import type { IFilesRepository } from './files.repository.interface';
import { and, eq } from 'drizzle-orm';
import { Either, Left, Right } from 'purify-ts';
import { useDatabase } from '~backend/shared/db';
import { filesTable } from '~backend/shared/db/schema/files';
import { DatabaseError } from '../../common/errors/base.error';

export const FilesRepository: IFilesRepository = {
	async createFile(
		params: Pick<FileInfo, 'hash' | 'size' | 'type' | 'mimeType'>,
	): Promise<Either<DatabaseError, FileInfo>> {
		try {
			const db = useDatabase();

			const [fileRecord] = await db.insert(filesTable).values(params).returning();

			if (!fileRecord) {
				return Left(
					new DatabaseError('Failed to create file record.', 'File record not created.'),
				);
			}
			return Right(fileRecord);
		} catch (error) {
			return Left(new DatabaseError('Failed to create file record.', error));
		}
	},

	async findFileByHash(
		hash: string,
		type: FileInfo['type'],
	): Promise<Either<DatabaseError, FileInfo | null>> {
		try {
			const db = useDatabase();

			const fileRecord = await db.query.filesTable.findFirst({
				where: and(eq(filesTable.hash, hash), eq(filesTable.type, type)),
			});

			return Right(fileRecord ?? null);
		} catch (error) {
			return Left(new DatabaseError('Failed to find file by hash.', error));
		}
	},

	/**
	 * Find file by its ID and optionally limit its type.
	 *
	 * @param id File ID
	 * @param type File type (optional)
	 */
	async findFileById(
		id: string,
		type?: FileInfo['type'],
	): Promise<Either<DatabaseError, FileInfo | null>> {
		try {
			const db = useDatabase();

			const fileRecord = await db.query.filesTable.findFirst({
				where: type
					? and(eq(filesTable.id, id), eq(filesTable.type, type))
					: eq(filesTable.id, id),
			});

			return Right(fileRecord ?? null);
		} catch (error) {
			return Left(new DatabaseError('Failed to find file by ID.', error));
		}
	},
};
