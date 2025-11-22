import { Button } from '@repo/ui/button';
import { Separator } from '@repo/ui/separator';
import { Large } from '@repo/ui/typography';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getOauth2Metadata } from '~web/libs/actions/api/auth';
import { getClientAppConfig } from '~web/libs/hooks/get-client-app-config';
import { respToEither } from '~web/libs/utils/resp';
import { OAuth2Buttons } from './OAuth2Buttons';
import { Signin } from './Signin';

export default async function SigninPage() {
	const t = await getTranslations();
	const config = getClientAppConfig();

	const oauth2Metadata = respToEither(await getOauth2Metadata());

	return (
		<>
			<Large className="mb-4 text-center">{t('auth.signin.page.title')}</Large>

			<Signin />

			{oauth2Metadata.isRight() && (
				<>
					<div className="flex flex-col gap-2">
						<Separator>
							<span className="bg-card">{t('common.labels.or')}</span>
						</Separator>
					</div>
					<OAuth2Buttons oauth2Metadata={oauth2Metadata.extract()} config={config} />
				</>
			)}

			<Button variant="link" asChild>
				<Link href="/auth/signup">{t('common.links.iDontHaveAccount')}</Link>
			</Button>

			<Button variant="link" asChild>
				<Link href="/auth/password-reset">{t('common.links.forgotDetails')}</Link>
			</Button>

			<Button variant="link" asChild>
				<Link href="/">{t('common.links.goBackToLanding')}</Link>
			</Button>
		</>
	);
}
