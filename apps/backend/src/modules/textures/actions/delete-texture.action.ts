import { EitherAsync, Left, Right } from 'purify-ts';
import { ForbiddenError } from '~backend/common/errors/base.error';
import { TextureNotFoundError } from '../textures.errors';
import { TexturesRepository } from '../textures.repository';

type Command = {
	userId: string;
	textureId: string;
};

export async function deleteTextureAction(cmd: Command) {
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
		.chain(async () => {
			return await TexturesRepository.deleteTexture(cmd.textureId);
		})
		.run();
}
