import { AuthRepository } from '../../auth.repository';

type Command = {
	userId: string;
};

export async function revokeAllSessionsAction(cmd: Command) {
	// userId is validated in the middleware
	return await AuthRepository.revokeSessionsByUser(cmd.userId);
}
