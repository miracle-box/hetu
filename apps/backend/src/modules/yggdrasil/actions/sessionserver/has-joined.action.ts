import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionLifecycle } from '#modules/auth/auth.entities';
import { YggdrasilService } from '#modules/yggdrasil/services/yggdrasil.service';
import { validateTokenUsecase } from '#modules/yggdrasil/usecases/authserver/validate-token.usecase';
import { verifyMojangJoinUsecase } from '#modules/yggdrasil/usecases/sessionserver/verify-mojang-join';
import { YggdrasilProfileNotFoundError } from '#modules/yggdrasil/yggdrasil.errors';
import { YggdrasilRepository } from '#modules/yggdrasil/yggdrasil.repository';

type Command = {
	username: string;
	serverId: string;
	// [TODO] Add IP recording
	ip?: string;
};

export const hasJoinedAction = (cmd: Command) => {
	return EitherAsync.fromPromise(() => YggdrasilRepository.findJoinRecordByServerId(cmd.serverId))
		.chain(async (joinRecord) => {
			if (joinRecord) {
				return EitherAsync.fromPromise(() =>
					validateTokenUsecase({
						accessToken: joinRecord.accessToken,
						allowedLifecycle: [SessionLifecycle.Active],
					}),
				).chain(() => {
					return YggdrasilRepository.getProfileDigestWithSkinsByName(cmd.username);
				});
			}

			return Right(null);
		})
		.chain(async (profile) => {
			if (profile) {
				return Right(profile);
			}
			// Join record not found, trying fetch profile from Mojang.
			return EitherAsync.fromPromise(() => verifyMojangJoinUsecase(cmd)).chain(
				async (profileId) => {
					if (!profileId) {
						return Right(null);
					}

					return YggdrasilRepository.getProfileDigestWithSkinsById(profileId);
				},
			);
		})
		.chain(async (profile) => {
			if (!profile) {
				return Left(new YggdrasilProfileNotFoundError(cmd.username));
			}

			return Right(YggdrasilService.getYggdrasilProfile(profile, true));
		})
		.run();
};
