import { EitherAsync, Right } from 'purify-ts';
import { FileType } from '#modules/files/files.entities';
import { FilesRepository } from '#modules/files/files.repository';
import { storageService } from '#modules/files/services/storage.service';

export interface UploadTextureParams {
	image: Buffer;
	fileType: typeof FileType.TEXTURE_SKIN | typeof FileType.TEXTURE_CAPE;
	hash: string;
}

export function uploadTextureUseCase(cmd: UploadTextureParams) {
	return EitherAsync.fromPromise(async () => {
		// Return existing file if possible
		return (await FilesRepository.findFileByHash(cmd.hash, cmd.fileType)).map(
			(existingFile) => ({
				existingFile,
				hash: cmd.hash,
				image: cmd.image,
			}),
		);
	}).chain(async ({ existingFile, hash, image }) => {
		if (existingFile) {
			return Right(existingFile);
		}

		// Upload file to storage and create file record in database
		return EitherAsync.fromPromise(() =>
			storageService.uploadFile(image, 'image/png', Buffer.from(hash, 'hex')),
		).chain(async (uploadedFile) => {
			const createFileResult = await FilesRepository.createFile({
				hash: hash,
				type: cmd.fileType,
				size: uploadedFile.size,
				mimeType: uploadedFile.type,
			});

			return createFileResult;
		});
	});
}
