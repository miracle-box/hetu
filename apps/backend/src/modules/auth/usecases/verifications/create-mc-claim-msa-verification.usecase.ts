import { EitherAsync } from 'purify-ts';
import {
	VERIFICATION_MC_CLAIM_MSA_TARGET,
	VERIFICATION_OAUTH2_EXPIRES_IN_MS,
	VERIFICATION_OAUTH2_TRIES,
} from '#modules/auth/auth.constants';
import { VerificationScenario, VerificationType } from '#modules/auth/auth.entities';
import { PKCEService } from '#modules/auth/services/pkce.service';
import { VerificationOperationService } from '#modules/auth/services/verification-operation.service';

export async function createMcClaimMsaVerificationUsecase() {
	const pkce = PKCEService.generateChallenge('S256');

	// Create verification record
	return EitherAsync.fromPromise(
		async () =>
			await VerificationOperationService.revokeAndCreateVerification({
				type: VerificationType.MC_CLAIM_VERIFICATION_MSA,
				scenario: VerificationScenario.MC_CLAIM_VERIFICATION,
				target: VERIFICATION_MC_CLAIM_MSA_TARGET,
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
