import { Elysia } from 'elysia';
import { createTextureHandler } from '#modules/textures/webapis/create-texture.handler';
import { deleteTextureHandler } from '#modules/textures/webapis/delete-texture.handler';
import { getTextureImageHandler } from '#modules/textures/webapis/get-texture-image.handler';
import { updateTextureHandler } from '#modules/textures/webapis/update-texture.handler';

export const TexturesRoutes = new Elysia({ prefix: '/textures' })
	.use(createTextureHandler)
	.use(getTextureImageHandler)
	.use(updateTextureHandler)
	.use(deleteTextureHandler);
