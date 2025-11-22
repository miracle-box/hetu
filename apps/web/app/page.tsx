import { Alert, AlertDescription, AlertTitle } from '@repo/ui/alert';
import { Button } from '@repo/ui/button';
import { Large } from '@repo/ui/typography';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function Home() {
	const t = await getTranslations();

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>{t('home.page.title')}</Large>

				<div className="flex gap-2">
					<Button asChild>
						<Link href="/auth/signin">{t('common.links.signIn')}</Link>
					</Button>
					<Button asChild>
						<Link href="/auth/signup">{t('common.links.signUp')}</Link>
					</Button>
					<Button asChild>
						<Link href="/app/dashboard">{t('common.links.goToApp')}</Link>
					</Button>
				</div>

				<Alert>
					<AlertTitle>{t('home.page.runningOn.title')}</AlertTitle>
					<AlertDescription>
						<div className="flex flex-col">
							<span>
								{t('home.page.runningOn.bun')}{' '}
								{typeof Bun !== 'undefined' ? Bun.version : '×'}
							</span>
							<span>
								{t('home.page.runningOn.nodejs')}{' '}
								{typeof process !== 'undefined' ? process.version : '×'}
							</span>
						</div>
					</AlertDescription>
				</Alert>
			</div>
		</main>
	);
}
