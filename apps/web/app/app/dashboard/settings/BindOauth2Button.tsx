'use client';

import { Button } from '@repo/ui/button';
import { useMutation } from '@tanstack/react-query';
import { requestVerification } from '~web/libs/actions/api';
import { getClientAppConfig } from '~web/libs/hooks/get-client-app-config';
import { ApiError } from '~web/libs/utils/api-error';
import { buildOAuth2AuthCodeUrl } from '~web/libs/utils/oauth2';
import { respToEither } from '~web/libs/utils/resp';

export type Props = {
	provider: string;
	metadata: {
		clientId: string;
		pkce: false | 'S256' | 'plain';
		authEndpoint: string;
		profileScopes: string[];
	};
};

export function BindOauth2Button({ provider, metadata }: Props) {
	const config = getClientAppConfig();

	const createOauth2VerificationMutaion = useMutation({
		mutationFn: (target: string) =>
			requestVerification({
				type: 'oauth2',
				scenario: 'oauth2_bind',
				target: target,
			}).then((resp) =>
				respToEither(resp)
					.mapLeft((error) => Promise.reject(new ApiError(error)))
					.extract(),
			),
		onSuccess: ({ verification }) => {
			const authUrl = buildOAuth2AuthCodeUrl(metadata.authEndpoint, {
				clientId: metadata.clientId,
				responseType: 'code',
				redirectUri: `${config.publicUrl}/auth/oauth2/callback`,
				scope: metadata.profileScopes,
				state: verification.id,
				pkce:
					metadata.pkce === false || !verification.challenge
						? undefined
						: {
								method: metadata.pkce,
								challenge: verification.challenge,
							},
			});

			window.location.href = authUrl;
		},
	});
	return (
		<Button onClick={() => createOauth2VerificationMutaion.mutate(provider)}>
			Bind [{provider}]
		</Button>
	);
}
