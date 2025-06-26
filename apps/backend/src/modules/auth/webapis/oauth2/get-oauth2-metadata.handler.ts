import { Elysia } from 'elysia';
import { getOauth2MetadataAction } from '../../actions/oauth2/get-oauth2-metadata.action';
import { getOauth2MetadataDtoSchemas } from '../../dtos/oauth2/get-oauth2-metadata.dto';

export const getOauth2MetadataHandler = new Elysia().get(
	'/oauth2/metadata',
	async () => {
		const result = await getOauth2MetadataAction();

		return result
			.map((data) => ({
				providers: data.providers,
			}))
			.extract();
	},
	{
		...getOauth2MetadataDtoSchemas,
		detail: {
			summary: 'Get OAuth2 Metadata',
			description: 'Get OAuth2 provider metadata for client configuration.',
			tags: ['Authentication'],
		},
	},
);
