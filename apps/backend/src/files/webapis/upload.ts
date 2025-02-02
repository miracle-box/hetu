import { Static, t } from 'elysia';
import { fileInfoSchema, FileType } from '~backend/files/files.entities';
import { uploadTexture } from '~backend/files/usecases/upload-texture';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createEnumLikeValuesSchema } from '~backend/shared/typing/utils';

export const uploadBodySchema = t.Object({
	type: createEnumLikeValuesSchema(FileType),
	file: t.File({
		// [TODO] Make this depends on file type.
		maxSize: '4m',
	}),
});
export const uploadResponseSchema = t.Object({
	file: fileInfoSchema,
});

export async function upload(
	body: Static<typeof uploadBodySchema>,
): Promise<Static<typeof uploadResponseSchema>> {
	if (body.type === FileType.TEXTURE_SKIN || body.type === FileType.TEXTURE_CAPE) {
		// Return FileInfo is fine for now.
		return {
			file: await uploadTexture(body.file, body.type),
		};
	} else {
		throw new AppError('files/invalid-file-type');
	}
}
