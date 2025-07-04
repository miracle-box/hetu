import { EitherAsync, Right } from 'purify-ts';
import { SessionLifecycle } from '~backend/modules/auth/auth.entities';
import { getLifecycle } from '~backend/shared/auth/utils';
import { AuthRepository } from '../../auth.repository';

type Command = {
	userId: string;
};

export async function listSessionsUsecase(cmd: Command) {
	return EitherAsync.liftEither(Right(cmd.userId))
		.chain(async (userId) => {
			const result = await AuthRepository.findSessionsByUser(userId);
			return result.map((sessions) => ({
				sessions: sessions.filter(
					(session) => getLifecycle(session) !== SessionLifecycle.Expired,
				),
			}));
		})
		.run();
}
