import { EitherAsync, Left, Right } from 'purify-ts';
import { ForbiddenError } from '~backend/common/errors/base.error';
import { TextureNotFoundError } from '../textures.errors';
import { TexturesRepository } from '../textures.repository';

type Command = {
	userId: string;
	textureId: string;
	name?: string;
	description?: string;
};

export async function updateTextureAction(cmd: Command) {
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
			return await TexturesRepository.updateTexture(texture.id, {
				name: cmd.name,
				description: cmd.description,
			});
		})
		.run();
}
