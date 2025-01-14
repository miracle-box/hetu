import { Elysia } from 'elysia';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { SessionScope } from '~backend/auth/auth.entities';
import {
	getUserInfo,
	getUserInfoParamsSchema,
	getUserInfoResponseSchema,
} from '~backend/users/webapis/get-user-info';
import {
	getUserProfiles,
	getUserProfilesParamsSchema,
	getUserProfilesResponseSchema,
} from '~backend/users/webapis/get-user-profiles';
import {
	getUserTextures,
	getUserTexturesParamsSchema,
	getUserTexturesResponseSchema,
} from '~backend/users/webapis/get-user-textures';

export const UsersRoutes = new Elysia({
	name: 'Routes.Users',
	prefix: '/users',
})
	.use(authMiddleware(SessionScope.DEFAULT))
	.get('/:id', async ({ params, user }) => await getUserInfo(params, user.id), {
		params: getUserInfoParamsSchema,
		response: {
			200: getUserInfoResponseSchema,
		},
		detail: {
			summary: 'Get User Info',
			description: 'Get account info of a user.',
			tags: ['Users'],
			security: [{ session: [] }],
		},
	})
	.get('/:id/profiles', async ({ params, user }) => await getUserProfiles(params, user.id), {
		params: getUserProfilesParamsSchema,
		response: {
			200: getUserProfilesResponseSchema,
		},
		detail: {
			summary: 'Get User Profiles',
			description: 'Get profiles of a user.',
			tags: ['Users'],
			security: [{ session: [] }],
		},
	})
	.get('/:id/textures', async ({ params, user }) => await getUserTextures(params, user.id), {
		params: getUserTexturesParamsSchema,
		response: {
			200: getUserTexturesResponseSchema,
		},
		detail: {
			summary: 'Get User Textures',
			description: 'Get textures of a user.',
			tags: ['Users'],
			security: [{ session: [] }],
		},
	});
