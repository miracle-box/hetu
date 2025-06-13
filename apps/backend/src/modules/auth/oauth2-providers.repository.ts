import { Maybe } from 'purify-ts';
import { Config } from '~backend/shared/config';

export type PKCEMethod = 'S256' | 'plain' | false;

export type OAuth2ProviderEndpoints = {
	authorization: string;
	token: string;
	userinfo: string;
};

export type OAuth2ProviderProfileMap = {
	id: string;
	email: string | false;
	username: string | false;
	avatarUrl: string | false;
	nickname: string | false;
};

export type OAuth2ProviderConfig = {
	protocol: 'oauth2';
	clientId: string;
	clientSecret: string;
	pkce: PKCEMethod;
	endpoints: OAuth2ProviderEndpoints;
	profileScopes: string[];
	profileMap: OAuth2ProviderProfileMap;
};

export type OAuth2ProviderPublicMetadata = {
	clientId: string;
	pkce: PKCEMethod;
	authEndpoint: string;
	profileScopes: string[];
};

/**
 * Repository for managing OAuth2 provider configurations
 */
export class OAuth2ProvidersRepository {
	/**
	 * Find OAuth2 provider configuration by name
	 * @param providerName The provider name to search for
	 * @returns OAuth2 provider configuration wrapped in Maybe, or Nothing if not found
	 */
	static findByName(providerName: string): Maybe<OAuth2ProviderConfig> {
		const provider = Object.entries(Config.app.oauth2.providers).find(
			([key]) => key === providerName,
		)?.[1];

		return Maybe.fromNullable(provider);
	}

	/**
	 * Get public metadata for all providers (excluding sensitive information)
	 * @returns Map of public provider metadata
	 */
	static getPublicMetadata(): Record<string, OAuth2ProviderPublicMetadata> {
		const providers = Config.app.oauth2.providers;
		const result: Record<string, OAuth2ProviderPublicMetadata> = {};

		for (const [name, config] of Object.entries(providers)) {
			result[name] = {
				clientId: config.clientId,
				pkce: config.pkce,
				authEndpoint: config.endpoints.authorization,
				profileScopes: config.profileScopes,
			};
		}

		return result;
	}
}
