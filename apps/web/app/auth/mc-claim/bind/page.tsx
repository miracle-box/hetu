import { Large } from '@repo/ui/typography';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { McClaimBindClient } from './McClaimBindClient';

export default async function McClaimBind() {
	const t = await getTranslations();

	return (
		<main className="container mx-auto">
			<Suspense
				fallback={
					<div className="flex flex-col gap-4">
						<Large>{t('auth.mcClaim.bind.title')}</Large>
						<div>{t('auth.mcClaim.bind.loading')}</div>
					</div>
				}
			>
				<McClaimBindClient />
			</Suspense>
		</main>
	);
}
