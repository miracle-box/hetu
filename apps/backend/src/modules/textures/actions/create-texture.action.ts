import type { TextureType } from '../textures.entities';
import { EitherAsync, Left, Right } from 'purify-ts';
import { TextureFileExistsForUserError } from '../textures.errors';
import { TexturesRepository } from '../textures.repository';

type Command = {
	userId: string;
	name: string;
	description: string;
	type: TextureType;
	hash: string;
};

export async function createTextureAction(cmd: Command) {
	return EitherAsync.fromPromise(() =>
		TexturesRepository.findUserTextureByHash(cmd.userId, cmd.type, cmd.hash),
	)
		.chain(async (existingTexture) => {
			if (existingTexture) {
				return Left(new TextureFileExistsForUserError(cmd.userId, cmd.type, cmd.hash));
			}
			return Right(null);
		})
		.chain(async () => {
			return await TexturesRepository.createTexture({
				authorId: cmd.userId,
				name: cmd.name,
				description: cmd.description,
				type: cmd.type,
				hash: cmd.hash,
			});
		})
		.run();
}
