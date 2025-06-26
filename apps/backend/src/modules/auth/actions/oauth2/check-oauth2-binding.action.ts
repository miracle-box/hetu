import { EitherAsync, Left } from 'purify-ts';
import { DatabaseError } from '~backend/common/errors/base.error';
import { UsersRepository } from '~backend/users/users.repository';
import { VerificationScenario } from '../../auth.entities';
import { OAuth2ValidatorService } from '../../services/oauth2-validator.service';
import { checkOauth2BindingUsecase } from '../../usecases/oauth2/check-oauth2-binding.usecase';

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
			// [FIXME] Waiting for new user service and repository.
			const user = await UsersRepository.findById(cmd.userId);
			if (!user) {
				return Left(new DatabaseError('User not found', undefined));
			}

			return await checkOauth2BindingUsecase({
				verification,
				provider,
				user,
			});
		})
		.map((binding) => {
			return {
				user: binding.user,
				oauth2Profile: binding.oauth2Profile,
				alreadyBound: binding.alreadyBound,
			};
		})
		.run();
}
