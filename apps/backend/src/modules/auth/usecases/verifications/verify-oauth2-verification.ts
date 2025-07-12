import type { Verification } from '#modules/auth/auth.entities';
import { Left } from 'purify-ts';
import { Logger } from '#logger';
import {
	InvalidOauth2GrantError,
	InvalidOauth2ProviderError,
	Oauth2MisconfiguredError,
} from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { OAuth2ProvidersRepository } from '#modules/auth/oauth2-providers.repository';

type Command = {
	id: string;
	code: string;
	verification: Verification;
	redirectUri?: string;
};

// Response format is defined in section 5.1 and 5.2.
type OAuth2TokenResponse = { error: string } | { access_token: string; token_type: string };

export async function verifyOauth2VerificationUsecase(cmd: Command) {
	const provider = OAuth2ProvidersRepository.findByName(cmd.verification.target).extract();
	if (!provider) {
		return Left(new InvalidOauth2ProviderError(cmd.verification.target));
	}

	// Construct and send token request
	// [TODO] Move this to a separate service (oauth2 requests)
	const tokenUri = provider.endpoints.token;
	const tokenRequestBody =
		`grant_type=authorization_code&code=${cmd.code}&client_id=${provider.clientId}&client_secret=${provider.clientSecret}` +
		`&scope=${provider.profileScopes.join(' ')}${
			cmd.redirectUri ? `&redirect_uri=${encodeURIComponent(cmd.redirectUri)}` : ''
		}${provider.pkce ? `&code_verifier=${cmd.verification.secret}` : ''}`;

	try {
		// [TODO] Move this to a separate service (centralized HTTP client)
		const tokenResponse = (await fetch(tokenUri, {
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
				`OAuth2 token request failed for provider: ${cmd.verification.target}`,
			);
			return Left(new InvalidOauth2GrantError(tokenResponse.error));
		}

		if (tokenResponse.token_type.toLowerCase() !== 'bearer') {
			Logger.error(
				`Invalid token type "${tokenResponse.token_type}" obtained from OAuth2 provider "${cmd.verification.target}". Only "bearer" is supported.`,
			);
			await AuthRepository.revokeVerificationById(cmd.id);
			return Left(new Oauth2MisconfiguredError());
		}

		const result = await AuthRepository.updateVerificationById(cmd.verification.id, {
			// [TODO] Store more information in the future
			secret: tokenResponse.access_token,
			verified: true,
		});

		return result.map((verification) => ({ verification }));
	} catch (error) {
		Logger.error(error, `OAuth2 verification failed for provider: ${cmd.verification.target}`);
		await AuthRepository.revokeVerificationById(cmd.id);

		return Left(new InvalidOauth2GrantError('OAuth2 request failed', error));
	}
}
