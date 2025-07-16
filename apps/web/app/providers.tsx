'use client';

import type React from 'react';
import {
	QueryClientProvider,
	HydrationBoundary,
	type DehydratedState,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { getQueryClient } from '~web/libs/api/query';
import { SessionManager } from '~web/libs/modules/auth/components/SessionManager';

export function Providers({
	children,
	dehydratedState,
}: {
	children: React.ReactNode;
	dehydratedState: DehydratedState;
}) {
	const queryClient = getQueryClient();

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<QueryClientProvider client={queryClient}>
				<HydrationBoundary state={dehydratedState}>
					{children}
					<ReactQueryDevtools />
					<SessionManager />
				</HydrationBoundary>
			</QueryClientProvider>
		</ThemeProvider>
	);
}
