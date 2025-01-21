import { Elysia } from 'elysia';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { upload, uploadBodySchema, uploadResponseSchema } from './webapis/upload';
import { SessionScope } from '~backend/auth/auth.entities';

export const FilesRoutes = new Elysia({
	name: 'Routes.Files',
	prefix: '/files',
})
	.use(authMiddleware(SessionScope.DEFAULT))
	.post(
		'/',
		async ({ body, set }) => {
			set.status = 'Created';
			return await upload(body);
		},
		{
			body: uploadBodySchema,
			response: {
				201: uploadResponseSchema,
			},
			detail: {
				summary: 'Upload File',
				description: 'Upload file before calling resource creation APIs.',
				tags: ['General'],
				security: [{ session: [] }],
			},
		},
	);
