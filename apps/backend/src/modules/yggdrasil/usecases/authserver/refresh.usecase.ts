import { EitherAsync, Right } from 'purify-ts';
import { AuthRepository } from '~backend/modules/auth/auth.repository';
import { SessionScope, type Session } from '../../../auth/auth.entities';
import { YggdrasilService } from '../../services/yggdrasil.service';
import { YggdrasilRepository } from '../../yggdrasil.repository';

type Command = {
	clientToken?: string;
	requestUser?: boolean;
	selectedProfileId?: string;
	session: Session;
};

export const refreshUsecase = async (cmd: Command) => {
	return EitherAsync.fromPromise(() => AuthRepository.revokeSessionById(cmd.session.id))
		.chain(async () => {
			return AuthRepository.createSession({
				userId: cmd.session.userId,
				metadata: {
					scope: SessionScope.YGGDRASIL,
					clientToken: YggdrasilService.createClientToken(cmd.clientToken),
					selectedProfile: cmd.selectedProfileId ?? null,
				},
			});
		})
		.chain(async (session) => {
			if (cmd.selectedProfileId) {
				return (await YggdrasilRepository.getProfileDigestById(cmd.selectedProfileId)).map(
					(profile) => ({ session, profile }),
				);
			}

			return Right({ session, profile: null });
		})
		.chain(async ({ session, profile }) => {
			return Right({
				accessToken: YggdrasilService.createAccessToken(session),
				clientToken: cmd.clientToken,
				user: cmd.requestUser ? { id: session.userId, properties: [] } : undefined,
				selectedProfile: profile
					? YggdrasilService.mapYggdrasilProfileDigest(profile)
					: undefined,
			});
		})
		.run();
};
