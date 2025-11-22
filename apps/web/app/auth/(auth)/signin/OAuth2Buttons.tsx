'use client';

import { API } from '@repo/api-client';
import { Button } from '@repo/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { requestVerification } from '~web/libs/actions/api/auth';
import { respToEither } from '~web/libs/api/resp';
import { ApiError } from '~web/libs/api/response';
import { buildOAuth2AuthCodeUrl } from '~web/libs/utils/oauth2';

export type Props = {
	oauth2Metadata: API.Auth.GetOauth2Metadata.Response200;
	config: {
		publicUrl: string;
	};
};
export function OAuth2Buttons({ oauth2Metadata, config }: Props) {
	const t = useTranslations();
	const createOauth2VerificationMutaion = useMutation({
		mutationFn: (target: string) =>
			requestVerification({
				type: API.Auth.Entities.VerificationType.OAUTH2,
				scenario: API.Auth.Entities.VerificationScenario.OAUTH2_SIGNIN,
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
					{t('common.buttons.signInWith', { provider: name })}
				</Button>
			))}
		</div>
	);
}
