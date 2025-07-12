import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionLifecycle } from '#modules/auth/auth.entities';
import { ProfilesRepository } from '#modules/profiles/profiles.repository';
import { validateTokenUsecase } from '#modules/yggdrasil/usecases/authserver/validate-token.usecase';
import {
	YggdrasilForbiddenError,
	YggdrasilProfileNotFoundError,
} from '#modules/yggdrasil/yggdrasil.errors';

type Command = {
	accessToken: string;
	profileId: string;
	textureType: 'skin' | 'cape';
};

export const resetTextureAction = (cmd: Command) => {
	return EitherAsync.fromPromise(() =>
		validateTokenUsecase({
			accessToken: cmd.accessToken,
			allowedLifecycle: [SessionLifecycle.Active],
		}),
	)
		.chain(async (validationResult) => {
			return (await ProfilesRepository.findProfileById(cmd.profileId))
				.chain((profile) => {
					if (!profile) {
						return Left(new YggdrasilProfileNotFoundError(cmd.profileId));
					}

					return Right(profile);
				})
				.chain((profile) => {
					if (profile.authorId !== validationResult.user.id) {
						return Left(new YggdrasilForbiddenError('Forbidden'));
					}

					return Right(profile);
				});
		})
		.chain(async (profile) => {
			if (cmd.textureType === 'skin') {
				return ProfilesRepository.updateProfile(profile.id, {
					skinTextureId: null,
				});
			} else if (cmd.textureType === 'cape') {
				return ProfilesRepository.updateProfile(profile.id, {
					capeTextureId: null,
				});
			}

			return Right(undefined);
		})
		.run();
};
