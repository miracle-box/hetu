import { EitherAsync, Left, Right } from 'purify-ts';
import { ForbiddenError } from '#common/errors/base.error';
import { ProfileNotFoundError } from '#modules/profiles/profiles.errors';
import { ProfilesRepository } from '#modules/profiles/profiles.repository';

type Command = {
	userId: string;
	profileId: string;
};

export async function deleteProfileAction(cmd: Command) {
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
		.chain(async () => {
			return await ProfilesRepository.deleteProfile(cmd.profileId);
		})
		.run();
}
