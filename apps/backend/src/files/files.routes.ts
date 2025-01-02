import { Elysia } from 'elysia';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { SessionScope } from '~backend/services/auth/session';
import { upload, uploadBodySchema, uploadResponseSchema } from './webapis/upload';

export const FilesRoutes = new Elysia({
	name: 'Routes.Files',
	prefix: '/files',
})
	.use(authMiddleware(SessionScope.DEFAULT))
	.post('/', async ({ body }) => await upload(body), {
		body: uploadBodySchema,
		response: {
			200: uploadResponseSchema,
		},
		detail: {
			summary: 'Upload File',
			description: 'Upload file before calling resource creation APIs.',
			tags: ['General'],
		},
	});
