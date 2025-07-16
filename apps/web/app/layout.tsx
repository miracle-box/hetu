import type { Metadata } from 'next';
import { cn } from '@repo/ui';
import { dehydrate } from '@tanstack/react-query';
import React from 'react';
import { getClientAppConfigAction } from '~web/libs/actions/get-client-site-config';
import { getQueryClient } from '~web/libs/api/query';
import { Providers } from './providers';
import { fontClasses } from '../libs/styling/fonts';
import './globals.css';

export const metadata: Metadata = {
	title: 'Hetu',
	description: 'Minecraft Account System',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Create a new query client for server-side prefetching
	const queryClient = getQueryClient();

	// Pre-fetch client app config on server side
	await queryClient.prefetchQuery({
		queryKey: ['clientAppConfig', process.env.NEXT_PUBLIC_BUILD_ID],
		queryFn: getClientAppConfigAction,
	});

	return (
		<html suppressHydrationWarning lang="en" className={cn(fontClasses)}>
			<body>
				{/* Vaul drawer background wrapper */}
				<div
					className="bg-background relative flex min-h-screen flex-col"
					data-vaul-drawer-wrapper
				>
					<Providers dehydratedState={dehydrate(queryClient)}>{children}</Providers>
				</div>
			</body>
		</html>
	);
}
