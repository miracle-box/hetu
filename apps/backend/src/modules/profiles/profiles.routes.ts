import { Elysia } from 'elysia';
import { createProfileHandler } from './webapis/create-profile.handler';
import { updateProfileHandler } from './webapis/update-profile.handler';

export const ProfilesRoutes = new Elysia({ prefix: '/profiles' })
	.use(createProfileHandler)
	.use(updateProfileHandler);
