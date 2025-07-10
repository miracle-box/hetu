import type { Session } from '../../auth.entities';
import { Left } from 'purify-ts';
import { SessionLifecycle, SessionScope } from '~backend/modules/auth/auth.entities';
import { getLifecycle } from '~backend/shared/auth/utils';
import { withTransaction } from '~backend/shared/db';
import { InvalidSessionError } from '../../auth.errors';
import { AuthRepository } from '../../auth.repository';

type Command = {
	session: Session;
};

export async function refreshSessionUsecase(cmd: Command) {
	const lifecycle = getLifecycle(cmd.session);
	if (
		lifecycle !== SessionLifecycle.Active &&
		lifecycle !== SessionLifecycle.Renewable &&
		lifecycle !== SessionLifecycle.RefreshOnly
	) {
		return Left(new InvalidSessionError());
	}
	return await withTransaction(async () => {
		const revokeResult = await AuthRepository.revokeSessionById(cmd.session.id);
		if (revokeResult.isLeft()) return revokeResult;

		const createResult = await AuthRepository.createSession({
			userId: cmd.session.userId,
			metadata: { scope: SessionScope.DEFAULT },
		});
		return createResult.map((session) => ({ session }));
	});
}
