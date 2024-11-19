import { Elysia } from 'elysia';
import { authMiddleware } from '~/shared/auth/middleware';
import { SessionScope } from '~/services/auth/session';
import { find, findQuery, findResponse } from '~/profiles/usecases/find';
import { create, createBodySchema, createResponseSchema } from '~/profiles/usecases/create';
import {
	update,
	updateBodySchema,
	updateParamsSchema,
	updateResponseSchema,
} from '~/profiles/usecases/update';

export const ProfilesController = new Elysia({ name: 'Controller.Profiles', prefix: '/profiles' })
	.get('/', async ({ query }) => await find(query), {
		query: findQuery,
		response: {
			200: findResponse,
		},
		detail: {
			summary: 'Find Profile',
			description: 'Find profile by UUID or player name.',
			tags: ['Profiles'],
		},
	})
	.use(authMiddleware(SessionScope.DEFAULT))
	.post(
		'/',
		async ({ body, set, user }) => {
			set.status = 'Created';
			return await create(body, user.id);
		},
		{
			body: createBodySchema,
			response: {
				201: createResponseSchema,
			},
			detail: {
				summary: 'Create profile',
				description:
					'Create a new profile. \n *Primary profile will be automatically handled.*',
				security: [{ sessionId: [] }],
				tags: ['Profiles'],
			},
		},
	)
	.patch('/:id', async ({ params, body, user }) => await update(params, body, user.id), {
		params: updateParamsSchema,
		body: updateBodySchema,
		response: {
			200: updateResponseSchema,
		},
		detail: {
			summary: 'Edit profile',
			description: 'Edit a part of the profile.',
			security: [{ sessionId: [] }],
			tags: ['Profiles'],
		},
	});
