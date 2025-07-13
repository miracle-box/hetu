import type { DatabaseError } from '#common/errors/base.error';
import type { FileInfo } from '#modules/files/files.entities';
import { Either } from 'purify-ts';

export interface IFilesRepository {
	/**
	 * Create a new file record.
	 *
	 * @param params File creation parameters
	 * @returns Either error or created file info
	 */
	createFile(
		params: Pick<FileInfo, 'hash' | 'size' | 'type' | 'mimeType'>,
	): Promise<Either<DatabaseError, FileInfo>>;

	/**
	 * Find file by hash and type.
	 *
	 * @param hash File hash
	 * @param type File type
	 * @returns Either error or file info (null if not found)
	 */
	findFileByHash(
		hash: string,
		type: FileInfo['type'],
	): Promise<Either<DatabaseError, FileInfo | null>>;

	/**
	 * Find file by ID and optionally limit its type.
	 *
	 * @param id File ID
	 * @param type File type (optional)
	 * @returns Either error or file info (null if not found)
	 */
	findFileById(
		id: string,
		type?: FileInfo['type'],
	): Promise<Either<DatabaseError, FileInfo | null>>;
}
