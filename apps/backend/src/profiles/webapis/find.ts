import { Static, t } from 'elysia';
import { Profile, profileSchema } from '~backend/profiles/profile.entities';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';
import { AppError } from '~backend/shared/middlewares/errors/app-error';

export const findQuery = t.Object({
	idOrName: t.String(),
	type: t.Union([t.Literal('id'), t.Literal('name')]),
});
export const findResponse = t.Object({
	profile: profileSchema,
});

export async function find(query: Static<typeof findQuery>): Promise<Static<typeof findResponse>> {
	let profile: Profile | null = null;

	if (query.type === 'id') profile = await ProfilesRepository.findById(query.idOrName);
	else if (query.type === 'name') profile = await ProfilesRepository.findByName(query.idOrName);

	if (!profile) throw new AppError('profiles/not-found');

	return { profile };
}
