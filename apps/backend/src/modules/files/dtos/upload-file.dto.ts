import { t } from 'elysia';
import { fileInfoSchema } from '#modules/files/files.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

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
	errors: ['files/malformed-file', 'files/invalid-file-type', 'internal-error'],
});
