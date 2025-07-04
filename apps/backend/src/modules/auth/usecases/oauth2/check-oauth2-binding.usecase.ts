import type { User } from '../../../users/users.entities';
import type { Verification } from '../../auth.entities';
import { EitherAsync, Left, Right } from 'purify-ts';
import { Oauth2AlreadyBoundError } from '../../auth.errors';
import { AuthRepository } from '../../auth.repository';
import { type OAuth2ProviderConfig } from '../../oauth2-providers.repository';
import { OAuth2ProfileService } from '../../services/oauth2-profile.service';

type Command = {
	verification: Verification;
	provider: OAuth2ProviderConfig;
	user: User;
};

export async function checkOauth2BindingUsecase(cmd: Command) {
	return EitherAsync.fromPromise(() =>
		OAuth2ProfileService.fetchProfile(cmd.provider, cmd.verification.secret),
	)
		.chain(async (profile) => {
			const bindingResult = await AuthRepository.findOAuth2Binding(
				cmd.verification.target,
				profile.id,
			);
			return bindingResult.map((maybeBinding) => ({ profile, maybeBinding }));
		})
		.chain(async ({ profile, maybeBinding }) => {
			if (maybeBinding && maybeBinding.userId !== cmd.user.id) {
				await AuthRepository.revokeVerificationById(cmd.verification.id);
				return Left(new Oauth2AlreadyBoundError());
			}

			return Right({ profile, maybeBinding });
		})
		.map(({ profile, maybeBinding }) => ({
			user: cmd.user,
			oauth2Profile: profile,
			alreadyBound: !!maybeBinding,
		}))
		.run();
}
