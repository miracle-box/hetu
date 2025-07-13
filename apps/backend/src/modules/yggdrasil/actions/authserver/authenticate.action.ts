import { EitherAsync } from 'purify-ts';
import { authenticateUsecase } from '#modules/yggdrasil/usecases/authserver/authenticate.usecase';
import { validateCredentialsUsecase } from '#modules/yggdrasil/usecases/authserver/validate-credentials.usecase';

type Command = {
	username: string;
	password: string;
	clientToken?: string;
	requestUser?: boolean;
	agent: {
		name: string;
		version: number;
	};
};

export const authenticateAction = (cmd: Command) => {
	return EitherAsync.fromPromise(() =>
		validateCredentialsUsecase({
			username: cmd.username,
			password: cmd.password,
		}),
	)
		.chain(async ({ user }) => {
			return authenticateUsecase({
				user,
				clientToken: cmd.clientToken,
				requestUser: cmd.requestUser,
				agent: cmd.agent,
			});
		})
		.run();
};
