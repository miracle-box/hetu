import { EitherAsync } from 'purify-ts';
import { AuthRepository } from '~backend/modules/auth/auth.repository';
import { validateCredentialsUsecase } from '../../usecases/authserver/validate-credentials.usecase';

type Command = {
	username: string;
	password: string;
};

export const signoutAction = (cmd: Command) => {
	return EitherAsync.fromPromise(() =>
		validateCredentialsUsecase({
			username: cmd.username,
			password: cmd.password,
		}),
	)
		.chain(async ({ user }) => {
			return AuthRepository.revokeSessionsByUser(user.id);
		})
		.run();
};
