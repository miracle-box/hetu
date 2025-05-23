import type { Metadata } from 'next';
import { cn } from '@repo/ui';
import React from 'react';
import { Providers } from './providers';
import { fontClasses } from '../libs/styling/fonts';
import './globals.css';

export const metadata: Metadata = {
	title: 'Hetu',
	description: 'Minecraft Account System',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html suppressHydrationWarning lang="en" className={cn(fontClasses)}>
			<body>
				{/* Vaul drawer background wrapper */}
				<div
					className="bg-background relative flex min-h-screen flex-col"
					data-vaul-drawer-wrapper
				>
					<Providers>{children}</Providers>
				</div>
			</body>
		</html>
	);
}
