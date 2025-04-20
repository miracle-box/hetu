'use client';

import { cn } from '@repo/ui';
import { Button } from '@repo/ui/button';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

// [TODO] Probably need a better way for generating links
const navigationItems = [
	{ segment: '(overview)', label: 'Overview', link: '/app/dashboard' },
	{ segment: 'profiles', label: 'Profiles', link: '/app/dashboard/profiles' },
	{ segment: 'textures', label: 'Textures', link: '/app/dashboard/textures' },
	{ segment: 'settings', label: 'Settings', link: '/app/dashboard/settings' },
] as const;

export function DashboardNavbar() {
	const buttonsRef = React.useRef<Map<string, HTMLButtonElement | null>>(new Map());

	const activeSegment = useSelectedLayoutSegment();
	React.useEffect(() => {
		console.log(activeSegment);
	}, [activeSegment]);

	const indicatorStyle = React.useMemo(() => {
		const activeBtn = buttonsRef.current.get(activeSegment ?? '');
		const firstBtn = buttonsRef.current.get(navigationItems[0].segment);

		if (!activeBtn || !firstBtn) return { width: 0, transform: 0 };

		const { width, left } = activeBtn.getBoundingClientRect();

		return {
			width,
			transform: left - firstBtn.getBoundingClientRect().left,
		};
	}, [activeSegment, buttonsRef]);

	return (
		<div className="relative">
			<nav className="bg-background scrollbar-none sticky top-0 z-10 w-full overflow-x-auto border-b">
				<div className="relative mx-auto flex items-center px-4 py-1">
					{navigationItems.map((item) => (
						<Button
							key={item.segment}
							ref={(el) => {
								buttonsRef.current.set(item.segment, el);
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
				</div>
			</nav>

			{/* Indicator */}
			<span
				className="bg-primary absolute bottom-0 left-4 z-20 h-[2px] transition-all duration-200"
				style={{
					width: `${indicatorStyle.width}px`,
					transform: `translateX(${indicatorStyle.transform}px)`,
				}}
			/>
		</div>
	);
}
