import { Elysia } from 'elysia';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { find, findQuery, findResponse } from './webapis/find';
import { create, createBodySchema, createResponseSchema } from './webapis/create';
import {
	update,
	updateBodySchema,
	updateParamsSchema,
	updateResponseSchema,
} from './webapis/update';
import { SessionScope } from '~backend/auth/auth.entities';

export const ProfilesRoutes = new Elysia({
	name: 'Routes.Profiles',
	prefix: '/profiles',
})
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
				tags: ['Profiles'],
				security: [{ session: [] }],
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
			tags: ['Profiles'],
			security: [{ session: [] }],
		},
	});
