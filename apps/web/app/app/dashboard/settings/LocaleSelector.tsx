'use client';

import { SegmentedControl, SegmentedControlItem } from '@repo/ui/segmented-control';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setLocale } from '~web/libs/actions/i18n';
import { type Locale, LocaleLabels, Locales } from '~web/libs/i18n/locales';

export function LocaleSelector({ currentLocale }: { currentLocale: Locale }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const handleLocaleChange = (locale: string) => {
		startTransition(async () => {
			await setLocale(locale as Locale);
			router.refresh();
		});
	};

	return (
		<SegmentedControl
			value={currentLocale}
			onValueChange={handleLocaleChange}
			disabled={isPending}
		>
			{Locales.map((locale) => (
				<SegmentedControlItem key={locale} value={locale}>
					{LocaleLabels[locale]}
				</SegmentedControlItem>
			))}
		</SegmentedControl>
	);
}
