import React from 'react';
import type { Metadata } from 'next';
import { fontClasses } from '../libs/styling/fonts';
import { Providers } from './providers';
import { Theme } from '@radix-ui/themes';
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
		<html suppressHydrationWarning lang="en" className={fontClasses}>
			<body>
				<Theme>
					<Providers>{children}</Providers>
				</Theme>
			</body>
		</html>
	);
}
