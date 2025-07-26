import queryString from 'query-string';

export type Oauth2AuthorizeOptions = {
	clientId: string;
	responseType: 'code';
	redirectUri: string;
	scope: string[];
	state?: string;
	pkce?: {
		method: 'S256' | 'plain';
		challenge: string;
	};
};

export function buildOAuth2AuthCodeUrl(endpoint: string, options: Oauth2AuthorizeOptions) {
	return queryString.stringifyUrl({
		url: endpoint,
		query: {
			client_id: options.clientId,
			response_type: options.responseType,
			redirect_uri: options.redirectUri,
			scope: options.scope.join(' '),
			state: options.state,
			code_challenge: options.pkce?.challenge,
			code_challenge_method: options.pkce?.method,
		},
	});
}
