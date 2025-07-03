import type { Session } from '../../auth.entities';
import { Left } from 'purify-ts';
import { SessionLifecycle } from '~backend/auth/auth.entities';
import { getLifecycle } from '~backend/shared/auth/utils';
import { InvalidSessionError } from '../../auth.errors';
import { AuthRepository } from '../../auth.repository';

type Command = {
	session: Session;
};

export async function renewSessionUsecase(cmd: Command) {
	const lifecycle = getLifecycle(cmd.session);

	if (lifecycle !== SessionLifecycle.Active && lifecycle !== SessionLifecycle.Renewable) {
		return Left(new InvalidSessionError());
	}

	return await AuthRepository.updateSession(cmd.session.id, {
		updatedAt: new Date(),
	});
}
