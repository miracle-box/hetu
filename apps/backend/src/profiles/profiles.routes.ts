import { Elysia } from 'elysia';
import { findHandler } from './webapis/find';
import { createHandler } from './webapis/create';
import { updateHandler } from './webapis/update';

export const ProfilesRoutes = new Elysia({
	name: 'Routes.Profiles',
	prefix: '/profiles',
})
	.use(findHandler)
	.use(createHandler)
	.use(updateHandler);
