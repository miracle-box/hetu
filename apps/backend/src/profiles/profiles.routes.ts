import { Elysia } from 'elysia';
import { createHandler } from './webapis/create';
import { findHandler } from './webapis/find';
import { updateHandler } from './webapis/update';

export const ProfilesRoutes = new Elysia({
	name: 'Routes.Profiles',
	prefix: '/profiles',
})
	.use(findHandler)
	.use(createHandler)
	.use(updateHandler);
