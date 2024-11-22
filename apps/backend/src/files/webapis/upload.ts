import { Static, t } from 'elysia';
import { fileInfoSchema, FileType } from '~/files/files.entities';
import { TexturesService } from '~/services/textures';
import { TextureType } from '~/textures/texture.entities';
import { CryptoHasher } from 'bun';
import { FilesRepository } from '~/files/files.repository';
import { StorageService } from '~/services/storage';

export const uploadBodySchema = t.Object({
	type: t.Enum(FileType),
	file: t.File({
		// [TODO] Make this depends on file type.
		maxSize: '4m',
	}),
});
export const uploadResponseSchema = fileInfoSchema;

export async function upload(
	body: Static<typeof uploadBodySchema>,
): Promise<Static<typeof uploadResponseSchema>> {
	// [TODO] Split processor of different file types
	let normalizedImage: Buffer | null = null;
	if (body.type === FileType.TEXTURE_SKIN || body.type === FileType.TEXTURE_CAPE) {
		if (body.type === FileType.TEXTURE_SKIN) {
			normalizedImage = await TexturesService.normalizeImage(body.file, TextureType.SKIN);
		} else {
			normalizedImage = await TexturesService.normalizeImage(body.file, TextureType.CAPE);
		}

		const hash = CryptoHasher.hash('sha256', normalizedImage);

		const fileRecord = await FilesRepository.findByHash(hash.toString('hex'), body.type);
		if (fileRecord) return fileRecord;

		// Upload and create file
		const uploadedFile = await StorageService.putObject(normalizedImage, 'image/png', hash);
		return await FilesRepository.create({
			hash: hash.toString('hex'),
			type: body.type,
			size: uploadedFile.size,
			mimeType: uploadedFile.type,
		});
	}

	throw new Error('Unknown file type');
}
