import { EitherAsync, Left, Right } from 'purify-ts';
import { VerificationScenario } from '#modules/auth/auth.entities';
import { OAuth2ValidatorService } from '#modules/auth/services/oauth2-validator.service';
import { checkOauth2BindingUsecase } from '#modules/auth/usecases/oauth2/check-oauth2-binding.usecase';
import { UserNotFoundError } from '#modules/users/users.errors';
import { UsersRepository } from '#modules/users/users.repository';

type Command = {
	verificationId: string;
	userId: string;
};

export async function checkOauth2BindingAction(cmd: Command) {
	return EitherAsync.fromPromise(() =>
		OAuth2ValidatorService.validateOAuth2Context(
			cmd.verificationId,
			VerificationScenario.OAUTH2_BIND,
		),
	)
		.chain(async ({ verification, provider }) => {
			const userResult = await UsersRepository.findUserById(cmd.userId);
			return userResult
				.mapLeft(() => new UserNotFoundError(cmd.userId))
				.chain((user) => {
					if (!user) {
						return Left(new UserNotFoundError(cmd.userId));
					}
					return Right({ verification, provider, user });
				});
		})
		.chain(async ({ verification, provider, user }) => {
			return checkOauth2BindingUsecase({
				verification,
				provider,
				user,
			});
		})
		.map((binding) => ({
			user: binding.user,
			provider: binding.provider,
			oauth2Profile: binding.oauth2Profile,
			alreadyBound: binding.alreadyBound,
		}))
		.run();
}
