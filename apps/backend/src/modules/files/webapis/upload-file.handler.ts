import { Elysia } from 'elysia';
import { SessionScope } from '#modules/auth/auth.entities';
import { uploadFileAction } from '#modules/files/actions/upload-file.action';
import { uploadFileDtoSchemas } from '#modules/files/dtos/upload-file.dto';
import { authMiddleware } from '#shared/auth/middleware';
import { AppError } from '#shared/middlewares/errors/app-error';

export const uploadFileHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).post(
	'/',
	async ({ body, set }) => {
		const result = await uploadFileAction({
			file: body.file,
			type: body.type,
		});

		return result
			.map((file) => {
				set.status = 'Created';
				return { file };
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'InvalidFileTypeError':
						throw new AppError('files/invalid-file-type');
					case 'TextureImageError':
						throw new AppError('files/malformed-file', {
							message: error.message,
						});
					case 'StorageError':
						throw new AppError('internal-error');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...uploadFileDtoSchemas,
		detail: {
			summary: 'Upload File',
			description: 'Upload file before calling resource creation APIs.',
			tags: ['General'],
			security: [{ session: [] }],
		},
	},
);
