'use client';

import type { Locale } from '#/libs/i18n/locales';
import type React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { getQueryClient } from '#/libs/api/query';
import { SessionManager } from '#/libs/modules/auth/components/SessionManager';
import { ClientTypeBoxInitializer } from './client-typebox-initializer';

export function ClientProviders({
	children,
	locale,
	messages,
}: {
	children: React.ReactNode;
	locale: Locale;
	messages: Record<string, unknown>;
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
				<NextIntlClientProvider locale={locale} messages={messages}>
					{children}
					<ClientTypeBoxInitializer />
				</NextIntlClientProvider>
				<ReactQueryDevtools />
				<SessionManager />
			</QueryClientProvider>
		</ThemeProvider>
	);
}
