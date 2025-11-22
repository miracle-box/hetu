import { Large } from '@repo/ui/typography';
import { getTranslations } from 'next-intl/server';
import { getOauth2Metadata } from '#/libs/actions/api/auth';
import { getLocale } from '#/libs/actions/i18n';
import { respToEither } from '#/libs/api/resp';
import { BindMcMsaButton } from './BindMcMsaButton';
import { BindOauth2Button } from './BindOauth2Button';
import { LocaleSelector } from './LocaleSelector';
import McClaimsList from './McClaimsList';

// We fetch data on server side, and wants to opt-out pre-rendering.
export const dynamic = 'force-dynamic';

export default async function Settings() {
	const t = await getTranslations();
	const locale = await getLocale();
	const providersResult = respToEither(await getOauth2Metadata());
	if (providersResult.isLeft()) {
		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-4">
					<Large>{t('dashboard.settings.page.title')}</Large>

					{/* Language Settings */}
					<section className="flex flex-col gap-2">
						<Large>{t('dashboard.settings.page.language.title')}</Large>
						<LocaleSelector currentLocale={locale} />
					</section>

					{/* OAuth2 account bindings */}
					<div className="flex flex-col gap-2">
						<div>
							{t('dashboard.settings.page.oauth2.loadFailed')}:{' '}
							{providersResult.extract().message}
						</div>
					</div>

					{/* Mojang Verification */}
					<section className="flex flex-col gap-2">
						<Large>{t('dashboard.settings.page.mcClaim.title')}</Large>
						<BindMcMsaButton />
						<McClaimsList />
					</section>
				</div>
			</main>
		);
	} else if (providersResult.isRight()) {
		const providers = providersResult.extract().providers;

		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-4">
					<Large>{t('dashboard.settings.page.title')}</Large>

					{/* Language Settings */}
					<section className="flex flex-col gap-2">
						<Large>{t('dashboard.settings.page.language.title')}</Large>
						<LocaleSelector currentLocale={locale} />
					</section>

					{/* OAuth2 account bindings */}
					<section className="flex flex-col gap-2">
						{providers &&
							Object.entries(providers).map(([name, metadata]) => (
								<BindOauth2Button key={name} provider={name} metadata={metadata} />
							))}
						{!providers && <div>{t('dashboard.settings.page.oauth2.noProviders')}</div>}
					</section>

					{/* Mojang Verification */}
					<section className="flex flex-col gap-2">
						<Large>{t('dashboard.settings.page.mcClaim.title')}</Large>
						<BindMcMsaButton />
						<McClaimsList />
					</section>
				</div>
			</main>
		);
	}
}
