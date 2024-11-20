import { Static, t } from 'elysia';

export enum FileType {
	TEXTURE_SKIN = 'texture_skin',
	TEXTURE_CAPE = 'texture_cape',
}

export const fileInfoSchema = t.Object({
	id: t.String(),
	hash: t.String(),
	size: t.Number(),
	type: t.Enum(FileType),
	mimeType: t.String(),
});

export type FileInfo = Static<typeof fileInfoSchema>;
