'use client';

import { Button } from '@repo/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { requestVerification } from '#/libs/actions/api/auth';
import { respToEither } from '#/libs/api/resp';
import { ApiError } from '#/libs/api/response';
import { useClientAppConfig } from '#/libs/hooks/use-client-app-config';
import { buildOAuth2AuthCodeUrl } from '#/libs/utils/oauth2';

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
	const t = useTranslations();
	const config = useClientAppConfig();

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
			{t('dashboard.settings.components.bindOauth2Button.label', { provider })}
		</Button>
	);
}
