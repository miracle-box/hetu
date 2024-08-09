import Elysia from 'elysia';
import { authMiddleware } from '~/auth/middleware';
import { ProfilesModel } from './profiles.model';
import { ProfilesService } from './profiles.service';

export const ProfilesController = new Elysia({ name: 'Controller.Profiles', prefix: '/profiles' })
	.use(ProfilesModel)
	.get(
		'/',
		async ({ query }) => {
			// [TODO] Return 404 if the profile is not found
			if ('user' in query) return await ProfilesService.getProfilesByUser(query.user);

			if ('id' in query) {
				const profile = await ProfilesService.getProfileById(query.id);
				if (profile) return [profile];
			}

			if ('name' in query) {
				const profile = await ProfilesService.getProfileByName(query.name);
				if (profile) return [profile];
			}

			return [];
		},
		{
			query: 'profiles.get.query',
			response: 'profiles.get.response',
			detail: {
				summary: 'Get profiles',
				description: 'Get profiles by user ID, UUID or player name.',
				tags: ['Profiles'],
				// Seems too complex for autogenerating OpenAPI docs, so we have to manually write it
				parameters: [
					{ name: 'user', in: 'query', schema: { type: 'string' }, required: false },
					{ name: 'id', in: 'query', schema: { type: 'string' }, required: false },
					{ name: 'name', in: 'query', schema: { type: 'string' }, required: false },
				],
			},
		},
	)
	.use(authMiddleware('default'))
	.post(
		'/',
		({ session, body }) => {
			// [TODO] HTTP status code should be "201 Created"
			return ProfilesService.createProfile(session.userId, body.name);
		},
		{
			body: 'profiles.create.body',
			response: 'profiles.create.response',
			detail: {
				summary: 'Create profile',
				description:
					'Create a new profile (primary profile will be automatically handled).',
				security: [{ sessionId: [] }],
				tags: ['Profiles'],
			},
		},
	);
