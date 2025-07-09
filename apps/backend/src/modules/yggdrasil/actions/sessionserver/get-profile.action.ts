import { EitherAsync, Left, Right } from 'purify-ts';
import { YggdrasilService } from '../../services/yggdrasil.service';
import { YggdrasilProfileNotFoundError } from '../../yggdrasil.errors';
import { YggdrasilRepository } from '../../yggdrasil.repository';

type Command = {
	profileId: string;
	unsigned?: boolean;
};

export const getProfileAction = (cmd: Command) => {
	return EitherAsync.fromPromise(() =>
		YggdrasilRepository.getProfileDigestWithSkinsById(cmd.profileId),
	)
		.chain(async (profile) => {
			if (!profile) {
				return Left(new YggdrasilProfileNotFoundError(cmd.profileId));
			}

			return Right(YggdrasilService.getYggdrasilProfile(profile, cmd.unsigned));
		})
		.run();
};
