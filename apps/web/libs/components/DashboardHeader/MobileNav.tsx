'use client';

import { cn } from '@repo/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { Button } from '@repo/ui/button';
import { useScrollLock } from '@repo/ui/hooks/use-scroll-lock';
import { useToggle } from '@repo/ui/hooks/use-toggle';
import { Icon } from '@repo/ui/icon';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { links } from './links';

type MobileMenuProps = {
	onMenuToggle?: (isOpen: boolean) => void;
};

export function MobileNav({ onMenuToggle }: MobileMenuProps) {
	const t = useTranslations();
	const [mobileNavOpen, toggleMobileNav] = useToggle();
	const { lock: lockScroll, unlock: unlockScroll } = useScrollLock({
		autoLock: false,
	});

	const handleToggle = () => {
		const newState = !mobileNavOpen;
		toggleMobileNav();

		if (newState === true) lockScroll();
		else unlockScroll();

		onMenuToggle?.(newState);
	};

	return (
		<>
			<Button
				variant="outline"
				size="icon"
				className="text-muted-foreground"
				onClick={handleToggle}
				aria-label="Toggle mobile menu"
			>
				{mobileNavOpen ? <Icon.X /> : <Icon.Menu />}
			</Button>

			<div
				// Find in page prevention not works on Safari
				// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert
				// Prevent focusing when menu is closed.
				inert={!mobileNavOpen}
				className={cn(
					'bg-background ease-drawer top-16 left-0 z-20 w-screen overflow-y-auto transition-all duration-500',
					{
						'absolute h-0': !mobileNavOpen,
						'fixed h-[calc(100dvh-4rem)]': mobileNavOpen,
					},
				)}
			>
				<nav className="p-4">
					<section className="flex flex-row justify-between gap-2 px-4">
						{/* [TODO] Replace with actual username */}
						<div className="font-medium">Username</div>
						<Avatar className="size-8">
							{/* [TODO] Replace with actual avatar */}
							<AvatarImage src="/favicon.ico" alt="User Avatar" />
							<AvatarFallback>U</AvatarFallback>
						</Avatar>
					</section>

					<hr className="my-2" />

					<section className="flex flex-col gap-2">
						{links.map((item) => (
							<Button
								variant="link"
								className="text-foreground w-full justify-start"
								key={item.href}
								asChild
							>
								<Link href={item.href}>{t(item.labelKey)}</Link>
							</Button>
						))}
					</section>
				</nav>
			</div>
		</>
	);
}
