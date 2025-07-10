import { Elysia } from 'elysia';
import { createTextureHandler } from './webapis/create-texture.handler';
import { getTextureImageHandler } from './webapis/get-texture-image.handler';

export const TexturesRoutes = new Elysia({ prefix: '/textures' })
	.use(createTextureHandler)
	.use(getTextureImageHandler);
