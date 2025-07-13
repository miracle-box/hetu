import { EitherAsync } from 'purify-ts';
import { YggdrasilService } from '#modules/yggdrasil/services/yggdrasil.service';
import { YggdrasilRepository } from '#modules/yggdrasil/yggdrasil.repository';

type Command = {
	usernames: string[];
};

export const getProfilesAction = (cmd: Command) => {
	return EitherAsync.fromPromise(() =>
		YggdrasilRepository.getProfilesDigestByNames(cmd.usernames),
	)
		.map((profiles) => {
			return profiles.map((profile) => YggdrasilService.mapYggdrasilProfileDigest(profile));
		})
		.run();
};
