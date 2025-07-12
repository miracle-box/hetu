import { EitherAsync } from 'purify-ts';
import { VerificationScenario } from '#modules/auth/auth.entities';
import { AuthRepository } from '#modules/auth/auth.repository';
import { OAuth2ValidatorService } from '#modules/auth/services/oauth2-validator.service';
import { oauth2SigninUsecase } from '#modules/auth/usecases/oauth2/oauth2-signin.usecase';

type Command = {
	verificationId: string;
};

export async function oauth2SigninAction(cmd: Command) {
	return EitherAsync.fromPromise(() =>
		OAuth2ValidatorService.validateOAuth2Context(
			cmd.verificationId,
			VerificationScenario.OAUTH2_SIGNIN,
		),
	)
		.chain(async ({ verification, provider }) => {
			await AuthRepository.revokeVerificationById(verification.id);

			return await oauth2SigninUsecase({
				verification,
				provider,
			});
		})
		.run();
}
