import { Left, Right } from 'purify-ts';
import { ForbiddenError } from '../../../common/errors/base.error';
import { UserNotFoundError } from '../users.errors';
import { UsersRepository } from '../users.repository';

type Command = {
	userId: string;
	requestingUserId: string;
};

export async function getUserInfoAction(command: Command) {
	// Check if user is requesting their own info
	if (command.requestingUserId !== command.userId) {
		return Left(new ForbiddenError());
	}

	const userResult = await UsersRepository.findUserById(command.userId);

	return userResult.chain((user) => {
		if (!user) {
			return Left(new UserNotFoundError(command.userId));
		}
		return Right(user);
	});
}
