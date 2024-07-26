import Elysia, { t } from 'elysia';
import { authMiddleware } from '~/auth/middleware';
import { TexturesModel } from './textures.model';

export const TexturesController = new Elysia({ name: 'Controller.Textures', prefix: '/textures' })
	.use(TexturesModel)
	.get('/:id', ({ params }) => {}, {
		response: 'textures.details.response',
		detail: {
			tags: ['Textures'],
		},
	})
	.use(authMiddleware)
	.put('/:id', ({ params }) => {}, {
		body: 'textures.replace-meta.body',
		response: 'textures.replace-meta.response',
		detail: {
			tags: ['Textures'],
		},
	})
	.put('/:id/image', ({ params }) => {}, {
		body: 'textures.replace-image.body',
		response: 'textures.replace-image.response',
		detail: {
			tags: ['Textures'],
		},
	})
	.patch('/:id', ({ params }) => {}, {
		body: 'textures.edit-meta.body',
		response: 'textures.edit-meta.response',
		detail: {
			tags: ['Textures'],
		},
	})
	.delete('/:id', ({ params }) => {}, {
		response: {
			204: t.Void(),
		},
		detail: {
			tags: ['Textures'],
		},
	});
