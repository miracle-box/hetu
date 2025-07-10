import { listSessionsUsecase } from '../../usecases/sessions/list-sessions.usecase';

type Command = {
	userId: string;
};

export async function listSessionsAction(cmd: Command) {
	// userId here is validated in the middleware
	return await listSessionsUsecase({ userId: cmd.userId });
}
