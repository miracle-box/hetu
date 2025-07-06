import { EitherAsync, Left, Right } from 'purify-ts';
import {
	PrimaryProfileAlreadyExistsError,
	ProfileNameAlreadyExistsError,
} from '../profiles.errors';
import { ProfilesRepository } from '../profiles.repository';

type Command = {
	userId: string;
	name: string;
	isPrimary: boolean;
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
			if (cmd.isPrimary) {
				return await ProfilesRepository.findPrimaryProfileByUser(cmd.userId);
			}
			return Right(undefined);
		})
		.chain(async (profile) => {
			if (profile) {
				return Left(new PrimaryProfileAlreadyExistsError(cmd.userId));
			}
			return Right(undefined);
		})
		.chain(async () => {
			return await ProfilesRepository.createProfile({
				authorId: cmd.userId,
				name: cmd.name,
				isPrimary: cmd.isPrimary,
			});
		})
		.run();
}
