'use client';

import { Button } from '@repo/ui/button';
import { useMutation } from '@tanstack/react-query';
import { requestVerification } from '~web/libs/actions/api';
import { getClientAppConfig } from '~web/libs/hooks/get-client-app-config';
import { buildOAuth2AuthCodeUrl } from '~web/libs/utils/oauth2';
import { respToEither } from '~web/libs/utils/resp';

// Microsoft Consumer tenant authorize endpoint
const MSA_AUTHORIZE_ENDPOINT = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize';

// Scope defined in backend auth.constants.ts (VERIFICATION_MC_CLAIM_MSA_SCOPE)
const MSA_SCOPE = ['XboxLive.signin'];

// ClientId should match server config app.mcClaimVerification.clientId
const MSA_CLIENT_ID = '32a1f6b7-3602-49b5-989a-06f3b5b53f36';

export function BindMcMsaButton() {
	const config = getClientAppConfig();

	const createVerificationMutation = useMutation({
		mutationFn: async () =>
			respToEither(
				await requestVerification({
					type: 'mc_claim_verification_msa',
					scenario: 'mc_claim_verification',
					target: 'msa',
				}),
			),
		onSuccess: (resp) => {
			resp.ifRight(({ verification }) => {
				const authUrl = buildOAuth2AuthCodeUrl(MSA_AUTHORIZE_ENDPOINT, {
					clientId: MSA_CLIENT_ID,
					responseType: 'code',
					redirectUri: `${config.publicUrl}/auth/oauth2/callback`,
					scope: MSA_SCOPE,
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
				? '跳转中...'
				: '绑定 Minecraft 账号（Mojang 正版）'}
		</Button>
	);
}
