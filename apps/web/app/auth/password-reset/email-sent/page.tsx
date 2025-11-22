import { Button } from '@repo/ui/button';
import { Large } from '@repo/ui/typography';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import GoVerify from './GoVerify';

export default async function EmailSent() {
	const t = await getTranslations();

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>{t('auth.passwordReset.page.emailSent.title')}</Large>

				<p className="text-foreground flex justify-center text-center text-sm">
					{t('auth.passwordReset.page.emailSent.message')}
					<br />
					{t('auth.passwordReset.page.emailSent.instruction')}
				</p>

				<GoVerify />

				<Button variant="secondary" asChild>
					<Link href="/">{t('common.links.goBackToLanding')}</Link>
				</Button>
			</div>
		</main>
	);
}
