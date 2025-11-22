'use client';

import { AvatarFallback, AvatarImage, Avatar } from '@repo/ui/avatar';
import { Button } from '@repo/ui/button';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { links } from './links';

export function DesktopNav() {
	const t = useTranslations();

	return (
		<div className="flex items-center gap-4">
			<div className="flex items-center">
				{links.map((item) => (
					<Button
						variant="link"
						className="text-muted-foreground"
						key={item.href}
						asChild
					>
						<Link href={item.href}>{t(item.labelKey)}</Link>
					</Button>
				))}
			</div>

			<Avatar className="size-8">
				{/* [TODO] Replace with actual avatar */}
				<AvatarImage src="/favicon.ico" alt="User Avatar" />
				<AvatarFallback>U</AvatarFallback>
			</Avatar>
		</div>
	);
}
