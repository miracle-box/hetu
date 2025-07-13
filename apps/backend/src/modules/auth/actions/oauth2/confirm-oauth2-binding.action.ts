import { EitherAsync } from 'purify-ts';
import { VerificationScenario } from '#modules/auth/auth.entities';
import { AuthRepository } from '#modules/auth/auth.repository';
import { OAuth2ValidatorService } from '#modules/auth/services/oauth2-validator.service';
import { confirmOauth2BindingUsecase } from '#modules/auth/usecases/oauth2/confirm-oauth2-binding.usecase';

type Command = {
	verificationId: string;
	userId: string;
};

export async function confirmOauth2BindingAction(cmd: Command) {
	return EitherAsync.fromPromise(() =>
		OAuth2ValidatorService.validateOAuth2Context(
			cmd.verificationId,
			VerificationScenario.OAUTH2_BIND,
		),
	)
		.chain(async ({ verification, provider }) => {
			await AuthRepository.revokeVerificationById(verification.id);

			const result = await confirmOauth2BindingUsecase({
				verification,
				provider,
				userId: cmd.userId,
			});

			return result;
		})
		.map((result) => ({
			created: result.created,
		}))
		.run();
}
