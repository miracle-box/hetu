import { ValuePointer } from '@sinclair/typebox/value';
import { Left, Right } from 'purify-ts';
import { Logger } from '~backend/shared/logger';
import { Oauth2MisconfiguredError } from '../auth.errors';
import { type OAuth2ProviderConfig } from '../oauth2-providers.repository';

export class OAuth2ProfileService {
	/**
	 * Fetch and map OAuth2 user profile from provider
	 * @param providerName The OAuth2 provider name
	 * @param accessToken The access token for the user
	 * @returns OAuth2 profile information
	 */
	static async fetchProfile(provider: OAuth2ProviderConfig, accessToken: string) {
		const response = await fetch(provider.endpoints.userinfo, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			Logger.error(
				`Failed to fetch user info from OAuth2 provider: ${response.status} ${response.statusText}`,
			);
			throw new Oauth2MisconfiguredError();
		}

		const data = await response.json();

		// [TODO] Should use something cleaner and safer
		// Map response values using JSON Pointer
		let id = ValuePointer.Get(data, provider.profileMap.id) as unknown;
		if (typeof id === 'number') id = id.toString();

		let email = provider.profileMap.email
			? ((ValuePointer.Get(data, provider.profileMap.email) as unknown) ?? undefined)
			: undefined;
		if (typeof email !== 'string') email = undefined;

		let username = provider.profileMap.username
			? ((ValuePointer.Get(data, provider.profileMap.username) as unknown) ?? undefined)
			: undefined;
		if (typeof username !== 'string') username = undefined;

		let avatarUrl = provider.profileMap.avatarUrl
			? ((ValuePointer.Get(data, provider.profileMap.avatarUrl) as unknown) ?? undefined)
			: undefined;
		if (typeof avatarUrl !== 'string') avatarUrl = undefined;

		let nickname = provider.profileMap.nickname
			? ((ValuePointer.Get(data, provider.profileMap.nickname) as unknown) ?? undefined)
			: undefined;
		if (typeof nickname !== 'string') nickname = undefined;

		if (typeof id !== 'string') {
			Logger.error(
				`Invalid OAuth2 user ID obtained from provider, check your profile mapping configuration!`,
			);
			return Left(new Oauth2MisconfiguredError());
		}

		return Right({
			id,
			email,
			username,
			avatarUrl,
			nickname,
		});
	}
}
