import type { Metadata } from 'next';
import { Theme } from '@radix-ui/themes';
import { cn } from '@repo/ui';
import React from 'react';
import { Providers } from './providers';
import { fontClasses } from '../libs/styling/fonts';
import '@radix-ui/themes/styles.css';
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
				<Theme>
					<Providers>{children}</Providers>
				</Theme>
			</body>
		</html>
	);
}
