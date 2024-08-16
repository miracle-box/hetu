import Elysia, { t } from 'elysia';
import { authMiddleware } from '~/auth/middleware';
import { TexturesModel } from './textures.model';
import { TexturesService } from './textures.service';

export const TexturesController = new Elysia({ name: 'Controller.Textures', prefix: '/textures' })
	.use(TexturesModel)
	.get(
		'/',
		async ({ query }) => {
			console.log({ query });

			// [TODO] Support all query params, and response with pagination info
			if (!query.author)
				throw new Error('Author is required, other query params are not supported yet.');
			return await TexturesService.getTexturesByUser(query.author);
		},
		{
			query: 'textures.search.query',
			response: 'textures.search.response',
			detail: {
				summary: 'Search for textures',
				description: 'Search textures by query and filters.',
				tags: ['Textures'],
			},
		},
	)
	.get(
		'/:id',
		async ({ params }) => {
			const texture = await TexturesService.getTextureById(params.id);
			if (!texture) throw new Error('Texture not found.');
			return texture;
		},
		{
			response: 'textures.details.response',
			detail: {
				summary: 'Get Texture',
				description: 'Get a specific texture.',
				tags: ['Textures'],
			},
		},
	)
	.use(authMiddleware('default'))
	.post(
		'/',
		async ({ session, body, set }) => {
			const texture = await TexturesService.createTexture(session.userId, body).catch(
				// [TODO] Temp solution for "Conflict" status code.
				(reason) => {
					if (reason.message === 'Texture already exists') set.status = 'Conflict';
					throw reason;
				},
			);

			set.status = 'Created';
			return texture;
		},
		{
			body: 'textures.upload.body',
			response: {
				201: 'textures.upload.response',
			},
			// [TODO] Probably it's better to put thissomewhere else
			transform: ({ body }) => {
				// Transform user input (base64 encoded png data uri) to File object
				const rawEncodedImage = body.image as unknown as string;
				if (!rawEncodedImage.startsWith('data:image/png;base64,')) {
					// [TODO] All errors in one place.
					throw new Error('PNG data URI is required for image field.');
				}

				const encodedImage = rawEncodedImage.split(',')[1];
				if (!encodedImage) {
					// [TODO] All errors in one place.
					throw new Error('PNG data URI is required for image field.');
				}

				const imageFile = new File([Buffer.from(encodedImage, 'base64')], '', {
					type: 'image/png',
				});

				body.image = imageFile;
			},
			detail: {
				summary: 'Create Texture',
				description: 'Create a new texture.',
				security: [{ sessionId: [] }],
				tags: ['Textures'],
			},
		},
	)
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
