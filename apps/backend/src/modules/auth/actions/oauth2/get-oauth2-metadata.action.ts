import { Either, Right } from 'purify-ts';
import { OAuth2ProvidersRepository } from '#modules/auth/oauth2-providers.repository';

type Result = {
	providers: Record<
		string,
		{
			clientId: string;
			pkce: false | 'S256' | 'plain';
			authEndpoint: string;
			profileScopes: string[];
		}
	>;
};

export async function getOauth2MetadataAction(): Promise<Either<never, Result>> {
	return Right({
		providers: OAuth2ProvidersRepository.getPublicMetadata(),
	});
}
