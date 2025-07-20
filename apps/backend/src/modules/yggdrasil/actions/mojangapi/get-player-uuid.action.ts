import { EitherAsync, Left, Right } from 'purify-ts';
import { YggdrasilService } from '#modules/yggdrasil/services/yggdrasil.service';
import { YggdrasilProfileNotFoundError } from '#modules/yggdrasil/yggdrasil.errors';
import { YggdrasilRepository } from '#modules/yggdrasil/yggdrasil.repository';

type Command = {
	name: string;
};

export const getPlayerUuidAction = (cmd: Command) => {
	return EitherAsync.fromPromise(() => YggdrasilRepository.getProfileDigestByName(cmd.name))
		.chain(async (profile) => {
			if (!profile) {
				return Left(new YggdrasilProfileNotFoundError(cmd.name));
			}

			return Right(YggdrasilService.mapYggdrasilProfileDigest(profile));
		})
		.run();
};
