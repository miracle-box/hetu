import { FileInfo, FileType } from '~/files/files.entities';
import { TexturesService } from '~/services/textures';
import { TextureType } from '~/textures/texture.entities';
import { CryptoHasher } from 'bun';
import { FilesRepository } from '~/files/files.repository';
import { StorageService } from '~/services/storage';

export async function uploadTexture(
	file: Blob,
	type: FileType.TEXTURE_SKIN | FileType.TEXTURE_CAPE,
): Promise<FileInfo> {
	const normalizedImage =
		type === FileType.TEXTURE_SKIN
			? await TexturesService.normalizeImage(file, TextureType.SKIN)
			: await TexturesService.normalizeImage(file, TextureType.CAPE);

	const hash = CryptoHasher.hash('sha256', normalizedImage);

	// Return existing file if possible
	const fileRecord = await FilesRepository.findByHash(hash.toString('hex'), type);
	if (fileRecord) return fileRecord;

	// Upload and create file
	const uploadedFile = await StorageService.putObject(normalizedImage, 'image/png', hash);
	return await FilesRepository.create({
		hash: hash.toString('hex'),
		type: type,
		size: uploadedFile.size,
		mimeType: uploadedFile.type,
	});
}
