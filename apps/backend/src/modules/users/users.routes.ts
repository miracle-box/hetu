import { Elysia } from 'elysia';
import { getUserInfoHandler } from './webapis/get-user-info.handler';
import { getUserProfilesHandler } from './webapis/get-user-profiles.handler';
import { getUserTexturesHandler } from './webapis/get-user-textures.handler';

export const UsersRoutes = new Elysia({
	name: 'Routes.Users',
	prefix: '/users',
})
	.use(getUserInfoHandler)
	.use(getUserProfilesHandler)
	.use(getUserTexturesHandler);
