'use client';

import type React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { getQueryClient } from '~web/libs/api/query';
import { SessionManager } from '~web/libs/modules/auth/components/SessionManager';

export function ClientProviders({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<QueryClientProvider client={queryClient}>
				{children}
				<ReactQueryDevtools />
				<SessionManager />
			</QueryClientProvider>
		</ThemeProvider>
	);
}
