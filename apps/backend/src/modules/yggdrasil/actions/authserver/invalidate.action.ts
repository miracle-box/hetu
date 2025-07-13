import { EitherAsync } from 'purify-ts';
import { SessionLifecycle } from '#modules/auth/auth.entities';
import { AuthRepository } from '#modules/auth/auth.repository';
import { validateTokenUsecase } from '#modules/yggdrasil/usecases/authserver/validate-token.usecase';

type Command = {
	accessToken: string;
	clientToken?: string;
};

export const invalidateAction = (cmd: Command) => {
	return EitherAsync.fromPromise(() =>
		validateTokenUsecase({
			accessToken: cmd.accessToken,
			clientToken: cmd.clientToken,
			allowedLifecycle: [
				SessionLifecycle.Active,
				SessionLifecycle.Renewable,
				SessionLifecycle.RefreshOnly,
			],
			ignoreClientToken: true,
		}),
	)
		.chain((validationResult) =>
			EitherAsync.fromPromise(() =>
				AuthRepository.revokeSessionById(validationResult.session.id),
			),
		)
		.run();
};
