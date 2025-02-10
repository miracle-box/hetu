import { Elysia, t } from 'elysia';
import { SessionScope } from '~backend/auth/auth.entities';
import { fileInfoSchema, FileType } from '~backend/files/files.entities';
import { uploadTexture } from '~backend/files/usecases/upload-texture';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';
import { createEnumLikeValuesSchema } from '~backend/shared/typing/utils';

export const uploadHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).post(
	'/',
	async ({ body, set }) => {
		if (body.type === FileType.TEXTURE_SKIN || body.type === FileType.TEXTURE_CAPE) {
			set.status = 'Created';
			// Return FileInfo is fine for now.
			return {
				file: await uploadTexture(body.file, body.type),
			};
		} else {
			throw new AppError('files/invalid-file-type');
		}
	},
	{
		body: t.Object({
			type: createEnumLikeValuesSchema(FileType),
			file: t.File({
				// [TODO] Make this depends on file type.
				maxSize: '4m',
			}),
		}),
		response: {
			201: t.Object({
				file: fileInfoSchema,
			}),
			...createErrorResps(415),
		},
		detail: {
			summary: 'Upload File',
			description: 'Upload file before calling resource creation APIs.',
			tags: ['General'],
			security: [{ session: [] }],
		},
	},
);
