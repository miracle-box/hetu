import { randomBytes, createHash } from 'node:crypto';
import { EitherAsync, Left } from 'purify-ts';
import { Config } from '~backend/shared/config';
import { VERIFICATION_OAUTH2_EXPIRES_IN_MS, VERIFICATION_OAUTH2_TRIES } from '../auth.constants';
import { VerificationType, VerificationScenario } from '../auth.entities';
import { InvalidOauth2ProviderError } from '../auth.errors';
import { revokeAndCreateVerification } from '../services/verifications.service';

type Command = {
	scenario: Extract<
		VerificationScenario,
		typeof VerificationScenario.OAUTH2_BIND | typeof VerificationScenario.OAUTH2_SIGNIN
	>;
	provider: string;
};

export async function createOauth2VerificationUsecase(cmd: Command) {
	// [TODO] This should be a repository
	const providerConfig = Object.entries(Config.app.oauth2.providers).find(
		([key]) => key === cmd.provider,
	)?.[1];

	if (!providerConfig) {
		return Left(new InvalidOauth2ProviderError(cmd.provider));
	}

	// Generate PKCE challenge
	// [TODO] Should be a service
	const verifier = randomBytes(32).toString('base64url');
	const challenge =
		providerConfig.pkce === 'S256'
			? createHash('sha256').update(verifier).digest('base64url')
			: providerConfig.pkce === 'plain'
				? verifier
				: null;

	// Create verification record
	return EitherAsync.fromPromise(
		async () =>
			await revokeAndCreateVerification({
				type: VerificationType.OAUTH2,
				scenario: cmd.scenario,
				target: cmd.provider,
				secret: verifier,
				expiresInMs: VERIFICATION_OAUTH2_EXPIRES_IN_MS,
				tries: VERIFICATION_OAUTH2_TRIES,
			}),
	)
		.map((createdVerification) => ({
			verification: createdVerification,
			challenge,
		}))
		.run();
}
