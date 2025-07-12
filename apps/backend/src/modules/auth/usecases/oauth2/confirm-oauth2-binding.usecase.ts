import { EitherAsync, Left, Right } from 'purify-ts';
import { type Verification } from '#modules/auth/auth.entities';
import { Oauth2AlreadyBoundError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { type OAuth2ProviderConfig } from '#modules/auth/oauth2-providers.repository';
import { OAuth2ProfileService } from '#modules/auth/services/oauth2-profile.service';

type Command = {
	verification: Verification;
	provider: OAuth2ProviderConfig;
	userId: string;
};

export async function confirmOauth2BindingUsecase(cmd: Command) {
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
			// Already bound to another user
			if (binding && binding.userId !== cmd.userId) {
				return Left(new Oauth2AlreadyBoundError());
			}
			return Right({ profile, binding });
		})
		.chain(async ({ profile, binding }) => {
			if (binding) {
				// Already bound to this user
				return Right({ created: false });
			}

			// Create new binding
			const result = await AuthRepository.upsertOAuth2({
				userId: cmd.userId,
				provider: cmd.verification.target,
				oauth2ProfileId: profile.id,
				// [TODO] Store more necessary info in database.
				metadata: {
					accessToken: cmd.verification.secret,
				},
			});

			return result.map(() => ({ created: true }));
		})
		.run();
}
