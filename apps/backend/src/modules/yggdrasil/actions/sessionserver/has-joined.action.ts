import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionLifecycle } from '#modules/auth/auth.entities';
import { YggdrasilService } from '#modules/yggdrasil/services/yggdrasil.service';
import { validateTokenUsecase } from '#modules/yggdrasil/usecases/authserver/validate-token.usecase';
import {
	YggdrasilProfileNotFoundError,
	YggdrasilServerSessionNotFoundError,
} from '#modules/yggdrasil/yggdrasil.errors';
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
				return Right({ valid: true, joinRecord });
			}

			return Left(new YggdrasilServerSessionNotFoundError(cmd.serverId));
		})
		.chain(async ({ joinRecord }) => {
			return EitherAsync.fromPromise(() =>
				validateTokenUsecase({
					accessToken: joinRecord.accessToken,
					allowedLifecycle: [SessionLifecycle.Active],
				}),
			).chain(() => {
				return YggdrasilRepository.getProfileDigestWithSkinsByName(cmd.username);
			});
		})
		.chain(async (profile) => {
			if (!profile) {
				return Left(new YggdrasilProfileNotFoundError(cmd.username));
			}

			return Right(YggdrasilService.getYggdrasilProfile(profile, true));
		})
		.run();
};
