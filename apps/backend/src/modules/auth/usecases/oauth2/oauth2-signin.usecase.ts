import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionScope, type Verification } from '#modules/auth/auth.entities';
import { Oauth2NotBoundError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { type OAuth2ProviderConfig } from '#modules/auth/oauth2-providers.repository';
import { OAuth2ProfileService } from '#modules/auth/services/oauth2-profile.service';

type Command = {
	verification: Verification;
	provider: OAuth2ProviderConfig;
};

export async function oauth2SigninUsecase(cmd: Command) {
	return EitherAsync.fromPromise(() =>
		OAuth2ProfileService.fetchProfile(cmd.provider, cmd.verification.secret),
	)
		.chain(async (profile) => {
			const bindingResult = await AuthRepository.findOAuth2Binding(
				cmd.verification.target,
				profile.id,
			);
			return bindingResult.map((binding) => ({ profile, binding }));
		})
		.chain(async ({ profile, binding }) => {
			if (!binding) {
				await AuthRepository.revokeVerificationById(cmd.verification.id);
				return Left(new Oauth2NotBoundError());
			}
			return Right({ profile, binding });
		})
		.chain(async ({ binding }) => {
			// Revoke verification
			await AuthRepository.revokeVerificationById(cmd.verification.id);

			// Create session
			return await AuthRepository.createSession({
				userId: binding.userId,
				metadata: {
					scope: SessionScope.DEFAULT,
				},
			});
		})
		.map((session) => ({
			session,
		}))
		.run();
}
