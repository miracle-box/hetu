import { cn, navigationMenuTriggerStyle } from '@repo/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from '@repo/ui/navigation-menu';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Links } from './Links';

export function DashboardHeader() {
	return (
		<header className="z-10 mx-auto flex h-16 w-full items-center px-4">
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

			<div className="hidden items-center gap-4 md:flex">
				<Links />

				<Avatar className="size-8">
					{/* [TODO] Replace with actual avatar */}
					<AvatarImage src="/favicon.ico" alt="User Avatar" />
					<AvatarFallback>U</AvatarFallback>
				</Avatar>
			</div>
		</header>
	);
}
