import { EitherAsync } from 'purify-ts';
import { SessionLifecycle } from '#modules/auth/auth.entities';
import { refreshUsecase } from '#modules/yggdrasil/usecases/authserver/refresh.usecase';
import { validateTokenUsecase } from '#modules/yggdrasil/usecases/authserver/validate-token.usecase';

type Command = {
	accessToken: string;
	clientToken?: string;
	requestUser?: boolean;
	selectedProfile?: {
		id: string;
		name: string;
	};
};

export const refreshAction = (cmd: Command) => {
	return EitherAsync.fromPromise(() =>
		validateTokenUsecase({
			accessToken: cmd.accessToken,
			clientToken: cmd.clientToken,
			allowedLifecycle: [
				SessionLifecycle.Active,
				SessionLifecycle.Renewable,
				SessionLifecycle.RefreshOnly,
			],
		}),
	)
		.chain((validationResult) =>
			refreshUsecase({
				session: validationResult.session,
				clientToken: cmd.clientToken,
				requestUser: cmd.requestUser,
				selectedProfileId: cmd.selectedProfile?.id,
			}),
		)
		.run();
};
