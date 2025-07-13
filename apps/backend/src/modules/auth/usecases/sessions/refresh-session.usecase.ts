import type { Session } from '#modules/auth/auth.entities';
import { Left } from 'purify-ts';
import { withTransaction } from '#db';
import { SessionLifecycle, SessionScope } from '#modules/auth/auth.entities';
import { InvalidSessionError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { getLifecycle } from '#shared/auth/utils';

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
