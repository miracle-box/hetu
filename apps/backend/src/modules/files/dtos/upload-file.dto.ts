import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { fileInfoSchema } from '../files.entities';

export const uploadFileDtoSchemas = createDtoSchemas({
	body: t.Object({
		type: t.Union([t.Literal('texture_skin'), t.Literal('texture_cape')]),
		file: t.File({
			// [TODO] Make this depends on file type.
			maxSize: '4m',
		}),
	}),
	response: {
		201: t.Object({
			file: fileInfoSchema,
		}),
	},
	errors: ['files/upload-failed', 'files/invalid-file-type', 'internal-error'],
});
