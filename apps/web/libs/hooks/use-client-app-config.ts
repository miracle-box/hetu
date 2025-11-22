import { useSuspenseQuery } from '@tanstack/react-query';
import { type ClientAppConfig } from '../utils/app-config/client';

export function useClientAppConfig(): ClientAppConfig {
	// Will be pre-fetched on server side using prefetchQuery and passed to the client,
	// see: app/layout.tsx (the root layout)

	const query = useSuspenseQuery({
		queryFn: () => {
			throw new Error('Query function called, client app config not correctly populated');
		},
		queryKey: ['clientAppConfig', process.env.NEXT_PUBLIC_BUILD_ID],
		gcTime: Infinity,
		staleTime: Infinity,
	});

	// [TODO] Show error screen if not cached, otherwise use the cached data and fail silently.
	if (!query.data) {
		throw new Error('No query data, client app config not correctly populated.');
	}

	return query.data as unknown as ClientAppConfig;
}
