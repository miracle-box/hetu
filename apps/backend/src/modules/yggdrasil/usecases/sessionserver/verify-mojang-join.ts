import type { YggProfile } from '#modules/yggdrasil/yggdrasil.entities';
import { EitherAsync, Left, Right } from 'purify-ts';
import { McClaimsRepository } from '#modules/users/mc-claims.repository';
import { YggdrasilService } from '#modules/yggdrasil/services/yggdrasil.service';
import { YggdrasilJoinServerAuthError } from '#modules/yggdrasil/yggdrasil.errors';

export type Command = {
	username: string;
	serverId: string;
	// [TODO] Add IP recording
	ip?: string;
};

export async function verifyMojangJoinUsecase(cmd: Command) {
	return EitherAsync.fromPromise(() =>
		fetch(
			`https://sessionserver.mojang.com/session/minecraft/hasJoined?username=${cmd.username}&serverId=${cmd.serverId}`,
		)
			.then((resp) => Right(resp))
			.catch(() => Left(new YggdrasilJoinServerAuthError(cmd.serverId))),
	)
		.chain(async (result) => {
			if (result.status !== 200) {
				return Right(null);
			}
			const respBody = (await result.json()) as YggProfile;

			return Right(YggdrasilService.getUnsignedUUID(respBody.id));
		})
		.chain(async (mojangProfileId) => {
			if (!mojangProfileId) {
				return Right(null);
			}

			return McClaimsRepository.findMcClaimByMcUuid(mojangProfileId);
		})
		.chain(async (mcClaim) => {
			if (!mcClaim || !mcClaim.boundProfileId) {
				return Right(null);
			}

			return Right(mcClaim.boundProfileId);
		})
		.run();
}
