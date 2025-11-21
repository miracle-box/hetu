import { Elysia } from 'elysia';
import { createProfileHandler } from '#modules/profiles/webapis/create-profile.handler';
import { deleteProfileHandler } from '#modules/profiles/webapis/delete-profile.handler';
import { updateProfileHandler } from '#modules/profiles/webapis/update-profile.handler';

export const ProfilesRoutes = new Elysia({ prefix: '/profiles' })
	.use(createProfileHandler)
	.use(updateProfileHandler)
	.use(deleteProfileHandler);
