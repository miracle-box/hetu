'use client';

import { cn } from '@repo/ui';
import { Button } from '@repo/ui/button';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React from 'react';

export function DashboardNavbar() {
	const t = useTranslations();

	// [TODO] Probably need a better way for generating links
	const navigationItems = React.useMemo(
		() =>
			[
				{
					segment: '(overview)',
					label: t('dashboard.settings.page.navigation.overview'),
					link: '/app/dashboard',
				},
				{
					segment: 'profiles',
					label: t('dashboard.settings.page.navigation.profiles'),
					link: '/app/dashboard/profiles',
				},
				{
					segment: 'textures',
					label: t('dashboard.settings.page.navigation.textures'),
					link: '/app/dashboard/textures',
				},
				{
					segment: 'settings',
					label: t('dashboard.settings.page.navigation.settings'),
					link: '/app/dashboard/settings',
				},
			] as const,
		[t],
	);

	const [buttonsRefMap, setButtonsRefMap] = React.useState(() => new Map<string, HTMLElement>());

	// Help updating the indicator on initial render, and manages button refs.
	const registerButtonRef = React.useCallback((key: string, el: HTMLElement | null) => {
		if (!el) return;
		setButtonsRefMap((prev) => {
			if (prev.get(key) === el) return prev;
			const newMap = new Map(prev);
			newMap.set(key, el);
			return newMap;
		});
	}, []);

	const activeSegment = useSelectedLayoutSegment();

	const indicatorStyle = React.useMemo(() => {
		const activeBtn = buttonsRefMap.get(activeSegment ?? '');
		const firstBtn = buttonsRefMap.get(navigationItems[0].segment);

		if (!activeBtn || !firstBtn) return { width: 0, transform: 0 };

		const { width, left } = activeBtn.getBoundingClientRect();

		return {
			width,
			transform: left - firstBtn.getBoundingClientRect().left,
		};
	}, [activeSegment, buttonsRefMap, navigationItems]);

	return (
		<div
			className={cn(
				'bg-background sticky top-0 z-10',
				// Fake border for easier indicator override
				'after:bg-border after:absolute after:bottom-0 after:left-0 after:h-px after:w-full',
			)}
		>
			<nav className="scrollbar-none relative flex w-full overflow-x-auto px-4 py-1">
				{navigationItems.map((item) => (
					<Button
						key={item.segment}
						ref={(el) => {
							registerButtonRef(item.segment, el);
						}}
						variant="ghost"
						size="sm"
						className={cn('p-3 text-sm', {
							'text-muted-foreground': activeSegment !== item.segment,
						})}
						asChild
					>
						<Link href={item.link}>{item.label}</Link>
					</Button>
				))}

				{/* Indicator */}
				<span
					className="bg-primary absolute bottom-0 left-4 z-10 h-[2px] transition-all ease-out"
					style={{
						width: `${indicatorStyle.width}px`,
						transform: `translateX(${indicatorStyle.transform}px)`,
					}}
				/>
			</nav>
		</div>
	);
}
