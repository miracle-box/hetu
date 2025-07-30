import type { Verification } from '#modules/auth/auth.entities';
import { Left } from 'purify-ts';
import { Logger } from '#logger';
import {
	VERIFICATION_MC_CLAIM_MSA_SCOPE,
	VERIFICATION_MC_CLAIM_MSA_TOKEN_ENDPOINT,
} from '#modules/auth/auth.constants';
import { InvalidOauth2GrantError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { Config } from '#shared/config/index';

type Command = {
	id: string;
	code: string;
	verification: Verification;
	redirectUri?: string;
};

// Response format is defined in section 5.1 and 5.2.
type OAuth2TokenResponse = { error: string } | { access_token: string; token_type: string };

export async function verifyMcClaimMsaVerificationUsecase(cmd: Command) {
	// Construct and send token request
	// [TODO] Move this to a separate service (oauth2 requests)
	const tokenRequestBody =
		`grant_type=authorization_code&code=${cmd.code}&client_id=${Config.app.mcClaimVerification.clientId}&client_secret=${Config.app.mcClaimVerification.clientSecret}` +
		`&scope=${VERIFICATION_MC_CLAIM_MSA_SCOPE}${
			cmd.redirectUri ? `&redirect_uri=${encodeURIComponent(cmd.redirectUri)}` : ''
		}&code_verifier=${cmd.verification.secret}}`;

	try {
		// [TODO] Move this to a separate service (centralized HTTP client)
		const tokenResponse = (await fetch(VERIFICATION_MC_CLAIM_MSA_TOKEN_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: tokenRequestBody,
		}).then((resp) => resp.json())) as OAuth2TokenResponse;

		if ('error' in tokenResponse) {
			await AuthRepository.revokeVerificationById(cmd.id);
			Logger.debug(
				tokenResponse,
				`OAuth2 token request failed for Minecraft claim MSA verification.`,
			);
			return Left(new InvalidOauth2GrantError(tokenResponse.error));
		}

		const result = await AuthRepository.updateVerificationById(cmd.verification.id, {
			secret: tokenResponse.access_token,
			verified: true,
		});

		return result.map((verification) => ({ verification }));
	} catch (error) {
		Logger.error(error, `OAuth2 verification failed for Minecraft claim MSA verification.`);
		await AuthRepository.revokeVerificationById(cmd.id);

		return Left(new InvalidOauth2GrantError('OAuth2 request failed', error));
	}
}
