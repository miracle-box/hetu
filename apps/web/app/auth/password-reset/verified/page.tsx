import { Button } from '@repo/ui/button';
import { Large } from '@repo/ui/typography';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { inspectVerification, verifyVerification } from '~web/libs/actions/api';
import { respToEither } from '~web/libs/utils/resp';
import { NewPassword } from './NewPassword';

type SearchParams = Promise<{ id?: string; secret?: string }>;

export default async function Verified({ searchParams }: { searchParams: SearchParams }) {
	const t = await getTranslations();
	const { id, secret } = await searchParams;

	if (!id || !secret) {
		return (
			<ThisPageLayout t={t}>
				{t('auth.passwordReset.page.verified.invalidLink')}
			</ThisPageLayout>
		);
	}

	const verif = respToEither(await inspectVerification(id));
	if (verif.isLeft() || !verif.isRight()) {
		return (
			<ThisPageLayout t={t}>
				{t('auth.passwordReset.page.verified.linkExpired')}
			</ThisPageLayout>
		);
	}

	if (!verif.extract().verification.verified) {
		const verifyResponse = respToEither(
			await verifyVerification({
				id,
				code: secret,
			}),
		);

		if (verifyResponse.isLeft()) {
			return (
				<ThisPageLayout t={t}>
					{t('auth.passwordReset.page.verified.verifyFailed')}
				</ThisPageLayout>
			);
		}
	}

	return (
		<ThisPageLayout t={t}>
			<NewPassword verificationId={id} />
		</ThisPageLayout>
	);
}

function ThisPageLayout({
	children,
	t,
}: {
	children: React.ReactNode;
	t: ReturnType<typeof getTranslations>;
}) {
	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>{t('auth.passwordReset.page.verified.title')}</Large>

				<div className="text-foreground flex text-sm">{children}</div>

				<Button variant="secondary" asChild>
					<Link href="/">{t('common.links.goBackToLanding')}</Link>
				</Button>
			</div>
		</main>
	);
}
