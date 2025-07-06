import type { FileInfo } from '../files.entities';
import { CryptoHasher } from 'bun';
import { Either, Left, Right } from 'purify-ts';
import { TexturesService } from '~backend/services/textures';
import { Logger } from '~backend/shared/logger';
import { TextureType } from '~backend/textures/texture.entities';
import { FileType } from '../files.entities';
import { FileUploadError, InvalidFileTypeError } from '../files.errors';
import { FilesRepository } from '../files.repository';
import { storageService } from '../services/storage.service';

type Command = {
	file: File;
	type: typeof FileType.TEXTURE_SKIN | typeof FileType.TEXTURE_CAPE;
};

// [TODO] Wait for other modules to be implemented.
export async function uploadTextureAction(
	command: Command,
): Promise<Either<InvalidFileTypeError | FileUploadError, FileInfo>> {
	// Validate file type
	if (command.type !== FileType.TEXTURE_SKIN && command.type !== FileType.TEXTURE_CAPE) {
		return Left(new InvalidFileTypeError(command.type));
	}

	try {
		// Normalize image based on type
		const normalizedImage =
			command.type === FileType.TEXTURE_SKIN
				? await TexturesService.normalizeImage(command.file, TextureType.SKIN)
				: await TexturesService.normalizeImage(command.file, TextureType.CAPE);

		const hash = CryptoHasher.hash('sha256', normalizedImage);

		// Return existing file if possible
		const existingFileResult = await FilesRepository.findFileByHash(
			hash.toString('hex'),
			command.type,
		);
		const existingFile = existingFileResult.caseOf({
			Left: () => null,
			Right: (file) => file,
		});

		if (existingFile) {
			return Right(existingFile);
		}

		// Upload file to storage
		const uploadResult = await storageService.uploadFile(normalizedImage, 'image/png', hash);

		const uploadedFile = uploadResult.caseOf({
			Left: (error) => {
				Logger.error(
					error,
					`Failed uploading file ${command.file.name} (${command.file.size}bytes, ${command.type}) to storage.`,
				);
				throw new FileUploadError('Failed to upload file to storage');
			},
			Right: (fileInfo) => fileInfo,
		});

		// Create file record in database
		const createFileResult = await FilesRepository.createFile({
			hash: hash.toString('hex'),
			type: command.type,
			size: uploadedFile.size,
			mimeType: uploadedFile.type,
		});

		return createFileResult.caseOf({
			Left: (error) => {
				Logger.error(
					error,
					`Failed to create file record for ${command.file.name} (${command.file.size}bytes, ${command.type}).`,
				);
				return Left(new FileUploadError('Failed to create file record'));
			},
			Right: (fileInfo) => Right(fileInfo),
		});
	} catch (error) {
		Logger.error(
			error,
			`Failed uploading file ${command.file.name} (${command.file.size}bytes, ${command.type}) to storage.`,
		);
		return Left(new FileUploadError('Failed to upload texture'));
	}
}
