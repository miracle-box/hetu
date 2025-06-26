import { EitherAsync, Left, Right } from 'purify-ts';
import { VerificationScenario } from '../auth.entities';
import { InvalidOauth2ProviderError, VerificationNotExistsError } from '../auth.errors';
import { AuthRepository } from '../auth.repository';
import { OAuth2ProvidersRepository } from '../oauth2-providers.repository';

export class OAuth2ValidatorService {
	/**
	 * Validate OAuth2 context (verification and provider)
	 * @param verificationId Verification ID
	 * @param scenario Verification scenario
	 * @returns Validated verification and provider configuration
	 */
	static async validateOAuth2Context(verificationId: string, scenario: VerificationScenario) {
		return EitherAsync.fromPromise(() =>
			AuthRepository.findVerifiedVerification(verificationId, scenario),
		)
			.chain(async (maybeVerification) => {
				if (maybeVerification === null) {
					return Left(new VerificationNotExistsError());
				}
				return Right(maybeVerification);
			})
			.chain(async (verification) => {
				return OAuth2ProvidersRepository.findByName(verification.target).mapOrDefault(
					(provider) => Right({ verification, provider }),
					Left(new InvalidOauth2ProviderError(verification.target)),
				);
			})
			.run();
	}
}
