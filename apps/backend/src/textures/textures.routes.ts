import { Elysia } from 'elysia';
import { inspectHandler } from './webapis/inspect';
import { getImageHandler } from './webapis/get-image';
import { createHandler } from './webapis/create';

export const TexturesRoutes = new Elysia({
	name: 'Routes.Textures',
	prefix: '/textures',
})
	.use(inspectHandler)
	.use(getImageHandler)
	.use(createHandler);
