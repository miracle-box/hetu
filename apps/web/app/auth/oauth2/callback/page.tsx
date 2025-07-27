import { Large } from '@repo/ui/typography';
import { redirect } from 'next/navigation';
import { getClientAppConfig } from '~web/libs/utils/app-config/client';
import { respToEither } from '~web/libs/utils/resp';
import { handleOAuth2Signin, handleVerifyVerification } from './actions';

export type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OAuthCallback({ searchParams }: Props) {
	const search = await searchParams;
	if (search['error']) {
		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-2">
					<Large>OAuth2 Callback</Large>

					<div className="flex gap-2">Error: {search['error']}</div>
					<div className="flex gap-2">
						Error description: {search['error_description']}
					</div>
				</div>
			</main>
		);
	}

	if (typeof search['code'] !== 'string' || typeof search['state'] !== 'string') {
		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-2">
					<Large>OAuth2 Callback</Large>

					<div className="flex gap-2">Invalid callback params.</div>
				</div>
			</main>
		);
	}

	const config = getClientAppConfig();
	const verificationId = search['state'];
	const code = search['code'];

	const verifyResponse = await handleVerifyVerification({
		id: verificationId,
		code,
		redirectUri: `${config.publicUrl}/auth/oauth2/callback`,
	}).then(respToEither);

	if (verifyResponse.isLeft()) {
		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-2">
					<Large>OAuth2 Callback</Large>

					<div className="flex gap-2">
						<div>Failed to verify your request: </div>
						<div>{verifyResponse.extract().message}</div>
					</div>
				</div>
			</main>
		);
	}

	// Handle signin
	if (
		verifyResponse.isRight() &&
		verifyResponse.extract().verification.scenario === 'oauth2_signin'
	) {
		const signinResponse = await handleOAuth2Signin({
			verificationId,
		}).then(respToEither);

		if (signinResponse.isLeft()) {
			return (
				<main className="container mx-auto">
					<div className="flex flex-col gap-2">
						<Large>OAuth2 Callback</Large>

						<div className="flex gap-2">
							<div>Signin failed: </div>
							<div>{signinResponse.extract().message}</div>
						</div>
					</div>
				</main>
			);
		}

		redirect('/app');
	}

	// Handle binding
	if (
		verifyResponse.isRight() &&
		verifyResponse.extract().verification.scenario === 'oauth2_bind'
	) {
		redirect(`/auth/oauth2/bind?verificationId=${verificationId}`);
	}
}
