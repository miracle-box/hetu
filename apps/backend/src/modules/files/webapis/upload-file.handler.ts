import { Elysia } from 'elysia';
import { SessionScope } from '~backend/modules/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { uploadFileAction } from '../actions/upload-file.action';
import { uploadFileDtoSchemas } from '../dtos/upload-file.dto';

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
