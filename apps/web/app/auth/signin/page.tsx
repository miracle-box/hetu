'use client';

import { Button } from '@repo/ui/button';
import { Icon } from '@repo/ui/icon';
import { Large } from '@repo/ui/typography';
import { mergeForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClientAppConfig } from '~web/libs/hooks/use-client-app-config';
import { useSigninForm, type SigninFormValues } from '~web/libs/modules/auth/forms/SigninForm';
import { ApiError } from '~web/libs/utils/api-error';
import { buildOAuth2AuthCodeUrl } from '~web/libs/utils/oauth2';
import { respToEither } from '~web/libs/utils/resp';
import { handleGetOauth2Metadata, handleRequestVerification, handleSignin } from './actions';

export default function Signin() {
	const router = useRouter();
	const config = useClientAppConfig();

	const oauth2Metadata = useQuery({
		queryKey: ['auth', 'oauth2-metadata'],
		queryFn: () =>
			handleGetOauth2Metadata().then((resp) =>
				respToEither(resp)
					.mapLeft((error) => Promise.reject(new ApiError(error)))
					.extract(),
			),
	});

	const createOauth2VerificationMutaion = useMutation({
		mutationFn: (target: string) =>
			handleRequestVerification({
				type: 'oauth2',
				scenario: 'oauth2_signin',
				target: target,
			}).then((resp) =>
				respToEither(resp)
					.mapLeft((error) => Promise.reject(new ApiError(error)))
					.extract(),
			),
		onSuccess: ({ verification }) => {
			const provider = oauth2Metadata.data?.providers[verification.target];
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

	const signinMutation = useMutation({
		mutationFn: handleSignin,
		onSuccess: (resp) => {
			respToEither(resp)
				.mapLeft((message) => mergeForm<SigninFormValues>(form, message))
				.ifRight(() => router.push('/'));
		},
	});

	const { form, formId, FormView } = useSigninForm({
		onSubmit: ({ value }) => signinMutation.mutate(value),
	});

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Sign In</Large>

				<FormView />
				<form.AppForm>
					<form.Submit>
						{(canSubmit, isSubmitting) => (
							<Button
								type="submit"
								form={formId}
								className="w-full"
								disabled={!canSubmit}
							>
								<>
									{isSubmitting && (
										<Icon.Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									<span>Sign In</span>
								</>
							</Button>
						)}
					</form.Submit>
				</form.AppForm>

				{/* OAuth2 logins */}
				{oauth2Metadata.data?.providers && (
					<div className="flex flex-col gap-2">
						{Object.entries(oauth2Metadata.data.providers).map(([name]) => (
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
				)}

				<Button variant="secondary" asChild>
					<Link href="/auth/signup">I don't have an account</Link>
				</Button>

				<Button variant="secondary" asChild>
					<Link href="/auth/password-reset">I have forgotten my details</Link>
				</Button>

				<Button variant="secondary" asChild>
					<Link href="/">Go back to landing page</Link>
				</Button>
			</div>
		</main>
	);
}
