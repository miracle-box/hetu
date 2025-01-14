'use client';

import { ThemeProvider } from 'next-themes';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '~web/libs/api/query';
import { RenewSession } from './RenewSession';

export function Providers({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();

	return (
		<ThemeProvider attribute="class">
			<QueryClientProvider client={queryClient}>
				{children}
				<ReactQueryDevtools />
				<RenewSession />
			</QueryClientProvider>
		</ThemeProvider>
	);
}
