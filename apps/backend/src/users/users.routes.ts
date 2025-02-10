import { Elysia } from 'elysia';
import { getUserInfoHandler } from './webapis/get-user-info';
import { getUserProfilesHandler } from './webapis/get-user-profiles';
import { getUserTexturesHandler } from './webapis/get-user-textures';

export const UsersRoutes = new Elysia({
	name: 'Routes.Users',
	prefix: '/users',
})
	.use(getUserInfoHandler)
	.use(getUserProfilesHandler)
	.use(getUserTexturesHandler);
