import { Left } from 'purify-ts';
import { ForbiddenError } from '../../../common/errors/base.error';
import { UsersRepository } from '../users.repository';

type Command = {
	userId: string;
	requestingUserId: string;
};

export async function getUserProfilesAction(command: Command) {
	// Check if user is requesting their own profiles
	if (command.requestingUserId !== command.userId) {
		return Left(new ForbiddenError());
	}

	return await UsersRepository.findProfilesByUser(command.userId);
}
