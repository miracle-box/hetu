import { Elysia, t } from 'elysia';
import { Profile, profileSchema } from '~backend/profiles/profile.entities';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const findHandler = new Elysia().get(
	'/',
	async ({ query }) => {
		let profile: Profile | null = null;

		if (query.type === 'id') profile = await ProfilesRepository.findById(query.idOrName);
		else if (query.type === 'name')
			profile = await ProfilesRepository.findByName(query.idOrName);

		if (!profile) throw new AppError('profiles/not-found');

		return { profile };
	},
	{
		query: t.Object({
			idOrName: t.String(),
			type: t.Union([t.Literal('id'), t.Literal('name')]),
		}),
		response: {
			200: t.Object({
				profile: profileSchema,
			}),
			...createErrorResps(404),
		},
		detail: {
			summary: 'Find Profile',
			description: 'Find profile by UUID or player name.',
			tags: ['Profiles'],
		},
	},
);
