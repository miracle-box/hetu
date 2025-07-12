import { EitherAsync, Right } from 'purify-ts';
import { SessionLifecycle } from '#modules/auth/auth.entities';
import { AuthRepository } from '#modules/auth/auth.repository';
import { getLifecycle } from '#shared/auth/utils';

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
