import { Static, t } from 'elysia';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';
import { profileSchema } from '~backend/profiles/profile.entities';

export const getUserProfilesParamsSchema = t.Object({
	id: t.String(),
});

export const getUserProfilesResponseSchema = t.Array(profileSchema);

export async function getUserProfiles(
	params: Static<typeof getUserProfilesParamsSchema>,
	userId: string,
): Promise<Static<typeof getUserProfilesResponseSchema>> {
	// [TODO] Allow get other user's info (profile digest).
	if (userId !== params.id) throw new Error('You can only get your own info.');

	return await ProfilesRepository.findByUser(params.id);
}
