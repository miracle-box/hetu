import type { EnumLikeValues } from '#shared/typing/utils';
import type { Static } from 'elysia';
import { t } from 'elysia';
import { createEnumLikeValuesSchema } from '#shared/typing/utils';

export const FileType = {
	TEXTURE_SKIN: 'texture_skin',
	TEXTURE_CAPE: 'texture_cape',
} as const;

export const fileInfoSchema = t.Object({
	id: t.String(),
	hash: t.String(),
	size: t.Number(),
	type: createEnumLikeValuesSchema(FileType),
	mimeType: t.String(),
});

export type FileType = EnumLikeValues<typeof FileType>;
export type FileInfo = Static<typeof fileInfoSchema>;
