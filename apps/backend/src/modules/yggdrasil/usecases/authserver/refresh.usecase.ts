import { EitherAsync, Right } from 'purify-ts';
import { SessionScope, type Session, type SessionMetadata } from '#modules/auth/auth.entities';
import { AuthRepository } from '#modules/auth/auth.repository';
import { YggdrasilService } from '#modules/yggdrasil/services/yggdrasil.service';
import { YggdrasilRepository } from '#modules/yggdrasil/yggdrasil.repository';

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
				// [FIXME] We should provide a better way to deal with sessions with different scopes.
				clientToken: (session.metadata as Extract<SessionMetadata, { scope: 'yggdrasil' }>)
					.clientToken,
				user: cmd.requestUser ? { id: session.userId, properties: [] } : undefined,
				selectedProfile: profile
					? YggdrasilService.mapYggdrasilProfileDigest(profile)
					: undefined,
			});
		})
		.run();
};
