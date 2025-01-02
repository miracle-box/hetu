import { Static, t } from 'elysia';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';
import { profileSchema } from '~backend/profiles/profile.entities';

export const createBodySchema = t.Object({
	name: t.String({ pattern: '[0-9A-Za-z_]{3,16}' }),
});
export const createResponseSchema = profileSchema;

export async function create(
	body: Static<typeof createBodySchema>,
	userId: string,
): Promise<Static<typeof createResponseSchema>> {
	const nameExists = !!(await ProfilesRepository.findByName(body.name));
	if (nameExists) throw new Error('Player name already been taken.');

	const hasPrimary = !!(await ProfilesRepository.findPrimaryByUser(userId));

	return await ProfilesRepository.create({
		authorId: userId,
		name: body.name,
		isPrimary: !hasPrimary,
	});
}
