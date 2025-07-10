import { EitherAsync, Left, Right } from 'purify-ts';
import { TextureNotFoundError } from '../textures.errors';
import { TexturesRepository } from '../textures.repository';

type Command = {
	textureId: string;
};

export async function findTextureAction(cmd: Command) {
	return EitherAsync.fromPromise(() => TexturesRepository.findTextureById(cmd.textureId))
		.chain(async (texture) => {
			if (!texture) {
				return Left(new TextureNotFoundError(cmd.textureId));
			}
			return Right(texture);
		})
		.run();
}
