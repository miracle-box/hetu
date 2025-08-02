import { EitherAsync, Left, Right } from 'purify-ts';
import { MinecraftApiService } from '../services/minecraft-api';
import { NoValidMcEntitlementError } from '../users.errors';

export type Command = {
	msaAccessToken: string;
};

export async function getPrivateMcProfileUsecase(cmd: Command) {
	return EitherAsync.fromPromise(() => MinecraftApiService.authXBL(cmd.msaAccessToken))
		.chain(async ({ token }) => {
			return MinecraftApiService.authXSTS(token);
		})
		.chain(async ({ token, userhash }) => {
			return MinecraftApiService.authMcServices(token, userhash);
		})
		.chain(async ({ token }) => {
			return EitherAsync.fromPromise(() => MinecraftApiService.hasClaims(token)).chain(
				async (hasClaims) => {
					if (!hasClaims) {
						return Left(new NoValidMcEntitlementError());
					}

					return Right({
						mcApiToken: token,
					});
				},
			);
		})
		.chain(async ({ mcApiToken }) => {
			return (await MinecraftApiService.getProfile(mcApiToken)).map((profile) => profile);
		})
		.run();
}
