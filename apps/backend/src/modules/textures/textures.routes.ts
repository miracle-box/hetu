import { Elysia } from 'elysia';
import { createTextureHandler } from '#modules/textures/webapis/create-texture.handler';
import { getTextureImageHandler } from '#modules/textures/webapis/get-texture-image.handler';

export const TexturesRoutes = new Elysia({ prefix: '/textures' })
	.use(createTextureHandler)
	.use(getTextureImageHandler);
