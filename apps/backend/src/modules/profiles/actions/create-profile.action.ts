import { EitherAsync, Left, Right } from 'purify-ts';
import { ProfileNameAlreadyExistsError } from '../profiles.errors';
import { ProfilesRepository } from '../profiles.repository';

type Command = {
	userId: string;
	name: string;
};

export async function createProfileAction(cmd: Command) {
	return EitherAsync.fromPromise(() => ProfilesRepository.findProfileByName(cmd.name))
		.chain(async (existingProfile) => {
			if (existingProfile) {
				return Left(new ProfileNameAlreadyExistsError(cmd.name));
			}
			return Right(undefined);
		})
		.chain(async () => {
			return await ProfilesRepository.findPrimaryProfileByUser(cmd.userId);
		})
		.chain(async (primaryProfile) => {
			// First profile is the primary profile.
			return await ProfilesRepository.createProfile({
				authorId: cmd.userId,
				name: cmd.name,
				isPrimary: !primaryProfile,
			});
		})
		.run();
}
