import { EitherAsync, Left, Right } from 'purify-ts';
import { ForbiddenError } from '~backend/common/errors/base.error';
import { storageService } from '~backend/modules/files/services/storage.service';
import { TextureNotFoundError } from '../textures.errors';
import { TexturesRepository } from '../textures.repository';

export interface GetTextureImageCommand {
	userId: string;
	textureId: string;
}

export const getTextureImageAction = (cmd: GetTextureImageCommand) => {
	return EitherAsync.fromPromise(() => TexturesRepository.findTextureById(cmd.textureId))
		.chain(async (texture) => {
			if (!texture) {
				return Left(new TextureNotFoundError(cmd.textureId));
			}
			return Right(texture);
		})
		.chain(async (texture) => {
			if (texture.authorId !== cmd.userId) {
				return Left(new ForbiddenError());
			}
			return Right(texture);
		})
		.chain(async (texture) => {
			return storageService.getPublicUrl(texture.hash);
		})
		.run();
};
