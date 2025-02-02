import { Static, t } from 'elysia';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';
import { profileSchema } from '~backend/profiles/profile.entities';
import { AppError } from '~backend/shared/middlewares/errors/app-error';

export const getUserProfilesParamsSchema = t.Object({
	id: t.String(),
});

export const getUserProfilesResponseSchema = t.Object({
	profiles: t.Array(profileSchema),
});

export async function getUserProfiles(
	params: Static<typeof getUserProfilesParamsSchema>,
	userId: string,
): Promise<Static<typeof getUserProfilesResponseSchema>> {
	// [TODO] Allow get other user's info (profile digest).
	if (userId !== params.id) throw new AppError('users/forbidden');

	return {
		profiles: await ProfilesRepository.findByUser(params.id),
	};
}
