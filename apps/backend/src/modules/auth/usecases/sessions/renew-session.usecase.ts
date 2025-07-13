import type { Session } from '#modules/auth/auth.entities';
import { Left } from 'purify-ts';
import { SessionLifecycle } from '#modules/auth/auth.entities';
import { InvalidSessionError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { getLifecycle } from '#shared/auth/utils';

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
