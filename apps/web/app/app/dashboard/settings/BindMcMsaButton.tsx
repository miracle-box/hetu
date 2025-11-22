'use client';

import { API } from '@repo/api-client';
import { Button } from '@repo/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { requestVerification } from '~web/libs/actions/api/auth';
import { respToEither } from '~web/libs/api/resp';
import { useClientAppConfig } from '~web/libs/hooks/use-client-app-config';
import { MsaOAuth2 } from '~web/libs/utils/constants';
import { buildOAuth2AuthCodeUrl } from '~web/libs/utils/oauth2';

export function BindMcMsaButton() {
	const t = useTranslations();
	const config = useClientAppConfig();

	const createVerificationMutation = useMutation({
		mutationFn: async () =>
			respToEither(
				await requestVerification({
					type: API.Auth.Entities.VerificationType.MC_CLAIM_VERIFICATION_MSA,
					scenario: API.Auth.Entities.VerificationScenario.MC_CLAIM_VERIFICATION,
					target: 'msa',
				}),
			),
		onSuccess: (resp) => {
			resp.ifRight(({ verification }) => {
				const authUrl = buildOAuth2AuthCodeUrl(MsaOAuth2.AuthorizeEndpoint, {
					clientId: config.msaClientId,
					responseType: 'code',
					redirectUri: `${config.publicUrl}/auth/oauth2/callback`,
					scope: MsaOAuth2.Scope,
					state: verification.id,
					pkce: verification.challenge
						? { method: 'S256', challenge: verification.challenge }
						: undefined,
				});

				const url = new URL(authUrl);
				url.searchParams.set('prompt', 'select_account');
				window.location.href = url.toString();
			});
		},
	});

	return (
		<Button
			onClick={() => createVerificationMutation.mutate()}
			disabled={createVerificationMutation.isPending}
		>
			{createVerificationMutation.isPending
				? t('dashboard.settings.page.mcClaim.redirecting')
				: t('dashboard.settings.page.mcClaim.bindButton')}
		</Button>
	);
}
