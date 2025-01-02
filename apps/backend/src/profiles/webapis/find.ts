import { Static, t } from 'elysia';
import { Profile, profileSchema } from '~backend/profiles/profile.entities';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';

export const findQuery = t.Object({
	idOrName: t.String(),
	type: t.Union([t.Literal('id'), t.Literal('name')]),
});
export const findResponse = profileSchema;

export async function find(query: Static<typeof findQuery>): Promise<Static<typeof findResponse>> {
	let profile: Profile | null = null;

	if (query.type === 'id') profile = await ProfilesRepository.findById(query.idOrName);
	else if (query.type === 'name') profile = await ProfilesRepository.findByName(query.idOrName);

	if (!profile) throw new Error('Profile not found');

	return profile;
}
