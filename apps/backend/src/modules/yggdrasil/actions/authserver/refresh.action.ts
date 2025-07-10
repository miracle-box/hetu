import { EitherAsync } from 'purify-ts';
import { SessionLifecycle } from '~backend/modules/auth/auth.entities';
import { refreshUsecase } from '../../usecases/authserver/refresh.usecase';
import { validateTokenUsecase } from '../../usecases/authserver/validate-token.usecase';

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
