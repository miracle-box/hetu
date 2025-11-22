import { Large } from '@repo/ui/typography';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { verifyVerification } from '#/libs/actions/api/auth';
import { respToEither } from '#/libs/api/resp';
import { getClientAppConfig } from '#/libs/utils/app-config/client';
import { ClientSignin } from './ClientSignin';

export type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OAuthCallback({ searchParams }: Props) {
	const t = await getTranslations();
	const search = await searchParams;
	if (search['error']) {
		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-2">
					<Large>{t('auth.oauth2.callback.title')}</Large>

					<div className="flex gap-2">
						{t('auth.oauth2.callback.error', { error: String(search['error']) })}
					</div>
					<div className="flex gap-2">
						{t('auth.oauth2.callback.errorDescription', {
							description: String(search['error_description'] || ''),
						})}
					</div>
				</div>
			</main>
		);
	}

	if (typeof search['code'] !== 'string' || typeof search['state'] !== 'string') {
		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-2">
					<Large>{t('auth.oauth2.callback.title')}</Large>

					<div className="flex gap-2">{t('auth.oauth2.callback.invalidParams')}</div>
				</div>
			</main>
		);
	}

	const config = getClientAppConfig();
	const verificationId = search['state'];
	const code = search['code'];

	const verifyResponse = await verifyVerification({
		id: verificationId,
		code,
		redirectUri: `${config.publicUrl}/auth/oauth2/callback`,
	}).then(respToEither);

	if (verifyResponse.isLeft()) {
		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-2">
					<Large>{t('auth.oauth2.callback.title')}</Large>

					<div className="flex gap-2">
						{t('auth.oauth2.callback.verifyFailed', {
							message: verifyResponse.extract().message,
						})}
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
		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-2">
					<Large>{t('auth.oauth2.callback.title')}</Large>

					<div className="flex gap-2">
						<ClientSignin verificationId={verificationId} />
					</div>
				</div>
			</main>
		);
	}

	// Handle binding
	if (
		verifyResponse.isRight() &&
		verifyResponse.extract().verification.scenario === 'oauth2_bind'
	) {
		redirect(`/auth/oauth2/bind?verificationId=${verificationId}`);
	}

	// Handle Minecraft claim verification (MSA)
	if (
		verifyResponse.isRight() &&
		verifyResponse.extract().verification.scenario === 'mc_claim_verification'
	) {
		redirect(`/auth/mc-claim/bind?verificationId=${verificationId}`);
	}
}
