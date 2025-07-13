import { EitherAsync, Left, Right } from 'purify-ts';
import { ForbiddenError } from '#common/errors/base.error';
import {
	ProfileNotFoundError,
	ProfileNameAlreadyExistsError,
} from '#modules/profiles/profiles.errors';
import { ProfilesRepository } from '#modules/profiles/profiles.repository';

type Command = {
	userId: string;
	profileId: string;
	name?: string;
	skinTextureId?: string | null;
	capeTextureId?: string | null;
};

export async function updateProfileAction(cmd: Command) {
	return EitherAsync.fromPromise(() => ProfilesRepository.findProfileById(cmd.profileId))
		.chain(async (profile) => {
			if (!profile) {
				return Left(new ProfileNotFoundError(cmd.profileId));
			}
			return Right(profile);
		})
		.chain(async (profile) => {
			if (profile.authorId !== cmd.userId) {
				return Left(new ForbiddenError());
			}
			return Right(profile);
		})
		.chain(async (profile) => {
			if (cmd.name && cmd.name !== profile.name) {
				const existingProfile = await ProfilesRepository.findProfileByName(cmd.name);
				return existingProfile.chain((foundProfile) => {
					if (foundProfile) {
						return Left(new ProfileNameAlreadyExistsError(cmd.name!));
					}
					return Right(profile);
				});
			}
			return Right(profile);
		})
		.chain(async () => {
			return await ProfilesRepository.updateProfile(cmd.profileId, {
				name: cmd.name,
				skinTextureId: cmd.skinTextureId,
				capeTextureId: cmd.capeTextureId,
			});
		})
		.run();
}
