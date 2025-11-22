import { Alert, AlertTitle } from '@repo/ui/alert';
import { Large } from '@repo/ui/typography';
import { getTranslations } from 'next-intl/server';

export type Props = {
	params: Promise<{ id: string }>;
};

export default async function InspectProfile({ params }: Props) {
	const t = await getTranslations();
	const { id } = await params;

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>{t('dashboard.profiles.page.profileId', { id })}</Large>

				<Alert>
					<AlertTitle>{t('dashboard.profiles.page.idParam', { id })}</AlertTitle>
				</Alert>
			</div>
		</main>
	);
}
