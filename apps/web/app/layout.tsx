import type { Metadata } from 'next';
import { cn } from '@repo/ui';
import React from 'react';
import './globals.css';
import ClientConfigProvider from './client-config-provider';
import { ClientProviders } from './client-providers';
import { fontClasses } from '../libs/styling/fonts';

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
		<html
			suppressHydrationWarning
			lang="en"
			className={cn(fontClasses, 'h-full min-h-[100dvh]')}
		>
			<body className="h-full min-h-[100dvh]">
				{/* Vaul drawer background wrapper */}
				<div
					className="bg-background relative h-full min-h-full w-full"
					data-vaul-drawer-wrapper
				>
					<ClientProviders>
						<ClientConfigProvider>{children}</ClientConfigProvider>
					</ClientProviders>
				</div>
			</body>
		</html>
	);
}
