import type { TextureType } from '#modules/textures/textures.entities';
import { EitherAsync, Left, Right } from 'purify-ts';
import { FileType } from '#modules/files/files.entities';
import { InvalidFileTypeError } from '#modules/files/files.errors';
import { FileHashingService } from '#modules/files/services/file-hashing.service';
import { uploadTextureUseCase } from '#modules/files/usecases/upload-texture.usecase';
import { TextureImageService } from '#modules/textures/services/texture-image.service';

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
