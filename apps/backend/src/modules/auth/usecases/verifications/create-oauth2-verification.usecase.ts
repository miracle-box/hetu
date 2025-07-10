import { EitherAsync, Left } from 'purify-ts';
import { VERIFICATION_OAUTH2_EXPIRES_IN_MS, VERIFICATION_OAUTH2_TRIES } from '../../auth.constants';
import { VerificationType, VerificationScenario } from '../../auth.entities';
import { InvalidOauth2ProviderError } from '../../auth.errors';
import { OAuth2ProvidersRepository } from '../../oauth2-providers.repository';
import { PKCEService } from '../../services/pkce.service';
import { VerificationOperationService } from '../../services/verification-operation.service';

type Command = {
	scenario: Extract<
		VerificationScenario,
		typeof VerificationScenario.OAUTH2_BIND | typeof VerificationScenario.OAUTH2_SIGNIN
	>;
	provider: string;
};

export async function createOauth2VerificationUsecase(cmd: Command) {
	const provider = OAuth2ProvidersRepository.findByName(cmd.provider).extract();

	if (!provider) {
		return Left(new InvalidOauth2ProviderError(cmd.provider));
	}

	const pkce = PKCEService.generateChallenge(provider.pkce);

	// Create verification record
	return EitherAsync.fromPromise(
		async () =>
			await VerificationOperationService.revokeAndCreateVerification({
				type: VerificationType.OAUTH2,
				scenario: cmd.scenario,
				target: cmd.provider,
				secret: pkce.verifier,
				expiresInMs: VERIFICATION_OAUTH2_EXPIRES_IN_MS,
				tries: VERIFICATION_OAUTH2_TRIES,
			}),
	)
		.map((createdVerification) => ({
			verification: createdVerification,
			challenge: pkce.challenge,
		}))
		.run();
}
