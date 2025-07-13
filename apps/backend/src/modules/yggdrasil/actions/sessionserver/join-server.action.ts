import { EitherAsync } from 'purify-ts';
import { SessionLifecycle } from '#modules/auth/auth.entities';
import { validateTokenUsecase } from '#modules/yggdrasil/usecases/authserver/validate-token.usecase';
import { YggdrasilRepository } from '#modules/yggdrasil/yggdrasil.repository';

type Command = {
	accessToken: string;
	selectedProfile: string;
	serverId: string;
};

export const joinServerAction = async (cmd: Command) => {
	return EitherAsync.fromPromise(() =>
		validateTokenUsecase({
			accessToken: cmd.accessToken,
			allowedLifecycle: [SessionLifecycle.Active],
		}),
	)
		.chain(async () => {
			return YggdrasilRepository.createJoinRecord({
				serverId: cmd.serverId,
				accessToken: cmd.accessToken,
				clientIp: '',
				expiresAt: new Date(new Date().getTime() + 30 * 1000),
			});
		})
		.run();
};
