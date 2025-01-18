import { Elysia } from 'elysia';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { create, createBodySchema, createResponseSchema } from './webapis/create';
import { inspect, inspectParamsSchema, inspectResponseSchema } from './webapis/inspect';
import { getImage, getImageParamsSchema, getImageResponseSchema } from './webapis/get-image';
import { SessionScope } from '~backend/auth/auth.entities';

export const TexturesRoutes = new Elysia({
	name: 'Routes.Textures',
	prefix: '/textures',
})
	.use(authMiddleware(SessionScope.DEFAULT))
	.get('/:id', async ({ params }) => await inspect(params), {
		params: inspectParamsSchema,
		response: {
			200: inspectResponseSchema,
		},
		detail: {
			summary: 'Get Texture',
			description: 'Get a specific texture.',
			tags: ['Textures'],
			security: [{ session: [] }],
		},
	})
	.get(
		'/:id/image',
		async ({ params, redirect }) => {
			const url = await getImage(params);
			return redirect(url, 302);
		},
		{
			params: getImageParamsSchema,
			response: {
				302: getImageResponseSchema,
			},
			detail: {
				summary: 'Get Texture Image',
				description: 'Redirect to actual file URL for a specific texture.',
				tags: ['Textures'],
				security: [{ session: [] }],
			},
		},
	)
	.post(
		'/',
		async ({ user, body, set }) => {
			set.status = 'Created';
			return await create(body, user.id);
		},
		{
			body: createBodySchema,
			response: {
				201: createResponseSchema,
			},
			detail: {
				summary: 'Create Texture',
				description: 'Create a new texture.',
				tags: ['Textures'],
				security: [{ session: [] }],
			},
		},
	);
