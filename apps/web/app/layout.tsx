import type { Metadata } from 'next';
import { cn } from '@repo/ui';
import { getMessages, getTranslations } from 'next-intl/server';
import React from 'react';
import './globals.css';
import { getLocale } from '#/libs/actions/i18n';
import { initializeTypeBoxErrorMessage } from '#/libs/utils/typebox-mesage';
import ClientConfigProvider from './client-config-provider';
import { ClientProviders } from './client-providers';
import { fontClasses } from '../libs/styling/fonts';

export const metadata: Metadata = {
	title: 'Hetu',
	description: 'Minecraft Account System',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const locale = await getLocale();
	const messages = await getMessages();
	const t = await getTranslations();

	initializeTypeBoxErrorMessage(t);

	return (
		<html
			suppressHydrationWarning
			lang={locale}
			className={cn(fontClasses, 'h-full min-h-[100dvh]')}
		>
			<body className="h-full min-h-[100dvh]">
				{/* Vaul drawer background wrapper */}
				<div
					className="bg-background relative h-full min-h-full w-full"
					data-vaul-drawer-wrapper
				>
					<ClientProviders locale={locale} messages={messages}>
						<ClientConfigProvider>{children}</ClientConfigProvider>
					</ClientProviders>
				</div>
			</body>
		</html>
	);
}
