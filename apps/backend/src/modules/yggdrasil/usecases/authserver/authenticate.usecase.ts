import type { User } from '~backend/modules/users/users.entities';
import { Right, EitherAsync } from 'purify-ts';
import { AuthRepository } from '~backend/modules/auth/auth.repository';
import { SessionScope } from '../../../auth/auth.entities';
import { YggdrasilService } from '../../services/yggdrasil.service';
import { YggdrasilRepository } from '../../yggdrasil.repository';

type Command = {
	user: User;
	clientToken?: string;
	requestUser?: boolean;
	agent?: {
		name: string;
		version: number;
	};
};

export const authenticateUsecase = async (cmd: Command) => {
	return EitherAsync.fromPromise(() => YggdrasilRepository.getProfilesDigestByUser(cmd.user.id))
		.chain(async (profiles) => {
			return Right({
				user: cmd.user,
				profiles: profiles.map((profile) =>
					YggdrasilService.mapYggdrasilProfileDigest(profile),
				),
			});
		})
		.chain(async ({ user, profiles }) => {
			return (
				await AuthRepository.createSession({
					userId: user.id,
					metadata: {
						scope: SessionScope.YGGDRASIL,
						clientToken: YggdrasilService.createClientToken(cmd.clientToken),
						selectedProfile: null,
					},
				})
			).map((session) => ({
				accessToken: YggdrasilService.createAccessToken(session),
				clientToken: cmd.clientToken,
				user: cmd.requestUser ? { id: user.id, properties: [] } : undefined,
				availableProfiles: profiles,
				selectedProfile: undefined,
			}));
		})
		.run();
};
