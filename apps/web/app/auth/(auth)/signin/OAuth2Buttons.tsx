'use client';

import type { Static } from '@sinclair/typebox';
import type { API } from '@repo/api-client';
import { Button } from '@repo/ui/button';
import { useMutation } from '@tanstack/react-query';
import { requestVerification } from '~web/libs/actions/api/auth';
import { ApiError } from '~web/libs/utils/api-error';
import { buildOAuth2AuthCodeUrl } from '~web/libs/utils/oauth2';
import { respToEither } from '~web/libs/utils/resp';

export type Props = {
	oauth2Metadata: Static<typeof API.Auth.GetOauth2Metadata.response200Schema>;
	config: {
		publicUrl: string;
	};
};
export function OAuth2Buttons({ oauth2Metadata, config }: Props) {
	const createOauth2VerificationMutaion = useMutation({
		mutationFn: (target: string) =>
			requestVerification({
				type: 'oauth2',
				scenario: 'oauth2_signin',
				target: target,
			}).then((resp) =>
				respToEither(resp)
					.mapLeft((error) => Promise.reject(new ApiError(error)))
					.extract(),
			),
		onSuccess: ({ verification }) => {
			const provider = oauth2Metadata.providers[verification.target];
			if (!provider) return;

			const authUrl = buildOAuth2AuthCodeUrl(provider.authEndpoint, {
				clientId: provider.clientId,
				responseType: 'code',
				redirectUri: `${config.publicUrl}/auth/oauth2/callback`,
				scope: provider.profileScopes,
				state: verification.id,
				pkce:
					provider.pkce === false || !verification.challenge
						? undefined
						: {
								method: provider.pkce,
								challenge: verification.challenge,
							},
			});

			window.location.href = authUrl;
		},
	});
	return (
		<div className="flex flex-col gap-2">
			{Object.entries(oauth2Metadata.providers).map(([name]) => (
				<Button
					key={name}
					variant="secondary"
					onClick={() => {
						createOauth2VerificationMutaion.mutate(name);
					}}
				>
					Sign in with [{name}]
				</Button>
			))}
		</div>
	);
}
