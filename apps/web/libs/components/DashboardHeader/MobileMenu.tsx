'use client';

import { Button } from '@repo/ui/button';
import { useToggle } from '@repo/ui/hooks/use-toggle';
import { Icon } from '@repo/ui/icon';

type MobileMenuProps = {
	onMenuToggle?: (isOpen: boolean) => void;
};

export function MobileMenu({ onMenuToggle }: MobileMenuProps) {
	const [mobileNavOpen, toggleMobileNav] = useToggle();

	const handleToggle = () => {
		const newState = !mobileNavOpen;
		toggleMobileNav();
		onMenuToggle?.(newState);
	};

	return (
		<>
			<Button
				variant="outline"
				size="icon"
				className="text-muted-foreground md:hidden"
				onClick={handleToggle}
				aria-label="Toggle mobile menu"
			>
				{mobileNavOpen ? <Icon.X /> : <Icon.Menu />}
			</Button>

			{mobileNavOpen && (
				<div className="bg-background fixed top-16 left-0 z-20 h-[calc(100dvh-4rem)] w-screen overflow-y-auto md:hidden">
					<nav></nav>
				</div>
			)}
		</>
	);
}
