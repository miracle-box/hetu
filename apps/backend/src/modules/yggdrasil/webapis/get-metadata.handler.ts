import { Elysia } from 'elysia';
import { getMetadataAction } from '../actions/get-metadata.action';
import { getMetadataDtoSchemas } from '../dtos/get-metadata.dto';

export const getMetadataHandler = new Elysia().get(
	'/',
	async () => {
		const result = await getMetadataAction();
		return result.extract();
	},
	{
		...getMetadataDtoSchemas,
		detail: {
			summary: 'Get Metadata',
			description: 'API metadata for authlib injector.',
			tags: ['Yggdrasil'],
		},
	},
);
