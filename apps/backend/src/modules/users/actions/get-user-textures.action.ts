import { Left } from 'purify-ts';
import { ForbiddenError } from '../../../common/errors/base.error';
import { UsersRepository } from '../users.repository';

type Command = {
	userId: string;
	requestingUserId: string;
};

export async function getUserTexturesAction(cmd: Command) {
	// Check if user is requesting their own textures
	if (cmd.requestingUserId !== cmd.userId) {
		return Left(new ForbiddenError());
	}

	return await UsersRepository.findTexturesByUser(cmd.userId);
}
