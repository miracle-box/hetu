import { Alert, AlertDescription, AlertTitle } from '@repo/ui/alert';
import { Large } from '@repo/ui/typography';
import { getTranslations } from 'next-intl/server';
import { getMyInfo } from '~web/libs/actions/api/me';
import { respToEither } from '~web/libs/utils/resp';

export default async function Dashboard() {
	const t = await getTranslations();
	const userInfo = respToEither(await getMyInfo());

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>{t('dashboard.overview.page.title')}</Large>

				<Alert>
					<AlertTitle>{t('dashboard.overview.page.loggedInAs')}</AlertTitle>

					<AlertDescription>
						{userInfo
							.map((info) => `${info.user.name} (${info.user.email})`)
							.mapLeft(({ message }) => message)
							.extract()}
					</AlertDescription>
				</Alert>
			</div>
		</main>
	);
}
