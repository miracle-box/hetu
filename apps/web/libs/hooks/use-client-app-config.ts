import { useQuery } from '@tanstack/react-query';
import { getClientAppConfigAction } from '../actions/get-client-site-config';
import { getClientAppConfig, type ClientAppConfig } from '../utils/app-config/client';

export function useClientAppConfig(): ClientAppConfig {
	// Called on server side
	if (typeof window === 'undefined') {
		return getClientAppConfig();
	}

	// Client side
	// Will be pre-fetched on server side using prefetchQuery and passed to the client,
	// see: app/layout.tsx (the root layout)

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const query = useQuery({
		queryFn: getClientAppConfigAction,
		queryKey: ['clientAppConfig', process.env.NEXT_PUBLIC_BUILD_ID],
		gcTime: Infinity,
		staleTime: Infinity,
	});

	// [TODO] Show error screen if not cached, otherwise use the cached data and fail silently.
	if (!query.data) {
		throw new Error('Client app config not correctly populated.');
	}

	return query.data;
}
