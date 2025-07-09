import type { TextureType } from '../../textures/textures.entities';
import { EitherAsync, Left, Right } from 'purify-ts';
import { TextureImageService } from '~backend/modules/textures/services/texture-image.service';
import { FileType } from '../files.entities';
import { InvalidFileTypeError } from '../files.errors';
import { FileHashingService } from '../services/file-hashing.service';
import { uploadTextureUseCase } from '../usecases/upload-texture.usecase';

type Command = {
	file: File;
	type: typeof FileType.TEXTURE_SKIN | typeof FileType.TEXTURE_CAPE;
};

export async function uploadFileAction(cmd: Command) {
	// Texture upload
	if (cmd.type === FileType.TEXTURE_SKIN || cmd.type === FileType.TEXTURE_CAPE) {
		const textureType: TextureType = cmd.type === FileType.TEXTURE_SKIN ? 'skin' : 'cape';

		return await EitherAsync.fromPromise(async () =>
			TextureImageService.normalizeImage(cmd.file, textureType),
		)
			.chain(async (normalizedImage) => {
				const hash = FileHashingService.hashSha256(normalizedImage);

				return Right({ normalizedImage, hash });
			})
			.chain(async ({ normalizedImage, hash }) => {
				return await uploadTextureUseCase({
					image: normalizedImage,
					fileType: cmd.type,
					hash,
				});
			});
	}

	return Left(new InvalidFileTypeError(cmd.type));
}
