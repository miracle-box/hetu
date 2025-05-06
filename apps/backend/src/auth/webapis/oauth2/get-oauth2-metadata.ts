import { Elysia, t } from 'elysia';
import { Config } from '~backend/shared/config';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const getOauth2MetadataHandler = new Elysia().get(
	'/oauth2',
	() => {
		const providerEntries = Object.entries(Config.app.oauth2.providers).map(
			([name, config]) =>
				[
					name,
					{
						clientId: config.clientId,
						pkce: config.pkce,
						authEndpoint: config.endpoints.authorization,
						// [TODO] Should be returned in verification request
						profileScopes: config.profileScopes,
					},
				] satisfies [string, unknown],
		);

		return { providers: Object.fromEntries(providerEntries) };
	},
	{
		response: {
			200: t.Object({
				providers: t.Record(
					t.String(),
					t.Object({
						clientId: t.String(),
						pkce: t.Union([t.Literal(false), t.Literal('S256'), t.Literal('plain')]),
						authEndpoint: t.String(),
						// [TODO] Should be returned in verification request
						profileScopes: t.Array(t.String()),
					}),
				),
			}),
			...createErrorResps(),
		},
		detail: {
			summary: 'Get OAuth2 Metadata',
			description: 'Get configurations and OAuth2 providers info.',
			tags: ['Authentication'],
		},
	},
);
