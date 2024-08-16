import { createInsertSchema } from 'drizzle-typebox';
import Elysia, { Static, t } from 'elysia';
import { textureTable } from '~/db/schema/texture';
import { textureSchema, textureTypeSchema } from '~/models/texture';

const originalTextureInsertSchema = createInsertSchema(textureTable);
const textureMetaSchema = t.Required(
	t.Pick(originalTextureInsertSchema, ['name', 'description', 'type']),
);

export const searchRequestSchema = t.Object({
	query: t.Optional(t.String()),
	author: t.Optional(t.String()),
	type: t.Array(textureTypeSchema, { default: ['skin', 'cape'] }),
	order: t.Union(
		[
			t.Literal('name'),
			t.Literal('name_desc'),
			t.Literal('updated'),
			t.Literal('updated_desc'),
		],
		{ default: 'name' },
	),
	// [TODO] General pagination query params
	page: t.Number({ default: 1 }),
	pageSize: t.Number({ default: 24 }),
});

export const uploadRequestSchema = t.Composite([
	textureMetaSchema,
	t.Object({
		image: t.File({
			type: 'image/png',
			// [TODO] Configurable size limits
			maxSize: '5m',
		}),
	}),
]);

export const replaceMetaRequestSchema = textureMetaSchema;

export const editMetaRequestSchema = t.Partial(textureMetaSchema);

export const replaceImageRequestSchema = t.File({
	type: 'image/png',
	// [TODO] Configurable size limits
	maxSize: '5m',
});

export type SearchRequest = Static<typeof searchRequestSchema>;
export type UploadRequest = Static<typeof uploadRequestSchema>;
export type ReplaceMetaRequest = Static<typeof replaceMetaRequestSchema>;
export type ReplaceImageRequest = Static<typeof replaceImageRequestSchema>;
export type EditMetaRequest = Static<typeof editMetaRequestSchema>;

export const TexturesModel = new Elysia({ name: 'Model.Textures' }).model({
	'textures.search.query': searchRequestSchema,
	'textures.search.response': t.Array(textureSchema),
	'textures.details.response': textureSchema,
	'textures.upload.body': uploadRequestSchema,
	'textures.upload.response': textureSchema,
	'textures.replace-meta.body': replaceMetaRequestSchema,
	'textures.replace-meta.response': textureSchema,
	'textures.replace-image.body': replaceImageRequestSchema,
	'textures.replace-image.response': textureSchema,
	'textures.edit-meta.body': editMetaRequestSchema,
	'textures.edit-meta.response': textureSchema,
});
