import { Elysia } from 'elysia';
import { createHandler } from './webapis/create';
import { getImageHandler } from './webapis/get-image';
import { inspectHandler } from './webapis/inspect';

export const TexturesRoutes = new Elysia({
	name: 'Routes.Textures',
	prefix: '/textures',
})
	.use(inspectHandler)
	.use(getImageHandler)
	.use(createHandler);
