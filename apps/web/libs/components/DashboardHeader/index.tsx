'use client';

import { cn } from '@repo/ui';
import { useBreakpoint } from '@repo/ui/hooks/use-breakpoint';
import {
	navigationMenuTriggerStyle,
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from '@repo/ui/navigation-menu';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
export function DashboardHeader() {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	const widerThanMd = useBreakpoint('md');

	return (
		<header
			className={cn('bg-background mx-auto flex h-16 w-full items-center px-4', {
				'sticky top-0 z-20': isMenuOpen,
			})}
		>
			{/* Logo */}
			<div className="mr-4 hidden items-center gap-2 sm:flex">
				<Link
					href="/app/dashboard"
					className="flex items-center gap-4 rounded-md focus-visible:outline-3 focus-visible:outline-offset-2"
				>
					<div className="relative size-8">
						{/* [TODO] Replace with actual logo */}
						<Image src="/favicon.ico" alt="Logo" fill className="object-contain" />
					</div>
					<span className="align-middle font-medium">Hetu</span>
				</Link>
			</div>

			{/* Context indicator and menu */}
			<NavigationMenu className="mr-auto">
				<NavigationMenuList>
					<NavigationMenuItem>
						{/* [TODO] Should be expandable and show the current context */}
						<NavigationMenuLink
							className={cn(navigationMenuTriggerStyle(), 'font-medium')}
						>
							Dashboard
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>

			{/* Avatar and links on desktop / Navigation menu on mobile */}
			{widerThanMd ? <DesktopNav /> : <MobileNav onMenuToggle={setIsMenuOpen} />}
		</header>
	);
}
